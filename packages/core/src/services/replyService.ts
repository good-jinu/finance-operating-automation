import path from "node:path";
import { runRouterAgent, streamRouterAgent } from "../agents";
import { findAttachmentsByMessageId } from "../models/Attachment";
import {
	findGmailMessageById,
	findGmailMessagesByIds,
} from "../models/GmailMessage";
import {
	countReplyMails,
	countReplyMailsByMessageId,
	countUnsentReplyMails,
	createReplyMail,
	deleteReplyMail,
	findAllReplyMails,
	findReplyMailById,
	findReplyMailsByMessageId,
	findReplyMailsByStatus,
	updateReplyMailContent,
	updateReplyMailSentStatus,
} from "../models/ReplyMail";
import { FILE_PATH } from "../utils/config";
import { buildGmailService, getCredentials } from "./auth";
import { GmailClient } from "./gmailClient";

export interface GenerateReplyStreamProgress {
	status: string;
	message: string;
	data?: any;
}

export async function* streamGenerateReply(
	mailId: number,
): AsyncGenerator<GenerateReplyStreamProgress> {
	yield {
		status: "starting",
		message: "AI 답변 생성을 시작합니다...",
	};

	// 1. 원본 메일 조회
	yield { status: "fetching_mail", message: "원본 메일을 조회합니다..." };
	const message = findGmailMessageById(mailId);
	if (!message) {
		throw new Error(`메일을 찾을 수 없습니다 (ID: ${mailId})`);
	}

	// 2. 첨부파일 조회
	yield { status: "fetching_attachments", message: "첨부파일을 확인합니다..." };
	const attachments = findAttachmentsByMessageId(message.message_id);
	const inputFilePaths = attachments.map((attachment) =>
		path.join(
			process.cwd(),
			FILE_PATH,
			`${message.message_id}/${attachment.file_name}`,
		),
	);
	yield {
		status: "starting_agent",
		message: "AI 에이전트를 실행하여 답변 초안을 생성합니다...",
	};

	// 3. AI 에이전트 스트림 실행
	const routerInput = `${message.subject || ""}\n\n${message.body || message.snippet || ""}`;
	const agentStream = await streamRouterAgent(routerInput, inputFilePaths);

	let mailTitle = "";
	let mailBody = "";
	let mailAttachments: string[] = [];

	for await (const chunk of agentStream) {
		console.log("Agent chunk:", chunk);
		const nodeName = Object.keys(chunk)[0];
		const nodeOutput = Object.values(chunk)[0] as any;

		let statusMessage = `에이전트 [${nodeName}] 실행 중...`;

		if (nodeName.includes("Provider")) {
			mailAttachments = nodeOutput.attachments ?? [];
		}

		if (nodeOutput?.messages) {
			const lastMessage = nodeOutput.messages.at(-1);
			if (lastMessage?.content) {
				statusMessage = lastMessage.content;
			}
		} else if (nodeName === "create_mail") {
			mailTitle = nodeOutput.mail_title;
			mailBody = nodeOutput.mail_body;
			statusMessage = "메일 초안이 생성되었습니다.";
		}

		yield { status: "agent_running", message: statusMessage, data: chunk };
	}

	// 4. DB에 답변 저장
	yield { status: "saving_reply", message: "답변을 데이터베이스에 저장합니다..." };
	if (message.id) {
		createReplyMail({
			original_message_id: message.message_id,
			subject: mailTitle || `Re: ${message.subject || "No Subject"}`,
			reply_body: mailBody,
			attachments: JSON.stringify(mailAttachments),
			is_sent: false,
		});
	}

	// 5. 원본 메일 읽음 처리
	yield { status: "marking_as_read", message: "원본 메일을 읽음으로 처리합니다..." };
	try {
		const creds = await getCredentials();
		const service = buildGmailService(creds);
		const gmailClient = new GmailClient(service);
		await gmailClient.markEmailAsRead(message.message_id);
	} catch (error: any) {
		yield {
			status: "warning",
			message: `메일을 읽음으로 처리하는 데 실패했습니다: ${error.message}`,
		};
	}

	yield { status: "complete", message: "모든 작업이 완료되었습니다." };
}

export interface GenerateRepliesProgress {

	totalEmails: number;
	processedEmails: number;
	successCount: number;
	errorCount: number;
	status: "running" | "completed" | "error";
	currentEmail?: {
		subject: string;
		sender: string;
		status: "processing" | "success" | "error";
	};
}

export async function generateRepliesForMails(
	mailIds: number[],
	progressCallback?: (progress: GenerateRepliesProgress) => void,
) {
	try {
		const messages = findGmailMessagesByIds(mailIds);

		if (!messages || messages.length === 0) {
			console.log("답변을 생성할 메일이 없습니다.");
			return {
				totalEmails: 0,
				processedEmails: 0,
				successCount: 0,
				errorCount: 0,
				status: "completed" as const,
			};
		}

		let successCount = 0;
		let errorCount = 0;

		console.log(`메일 ${messages.length}개에 대한 답변 생성 시작`);

		// Gmail 클라이언트 초기화 (읽음 표시를 위해)
		let gmailClient: GmailClient | null = null;
		try {
			const creds = await getCredentials();
			const service = buildGmailService(creds);
			gmailClient = new GmailClient(service);
		} catch (error) {
			console.warn(
				"Gmail 클라이언트 초기화 실패 - 읽음 표시 기능을 사용할 수 없습니다:",
				error,
			);
		}

		for (let i = 0; i < messages.length; i++) {
			const message = messages[i];

			try {
				console.log(
					`답변 생성 중: ${message.subject || ""} (${i + 1}/${
						messages.length
					})`,
				);

				// AI 에이전트를 통해 라우팅 및 응답 생성
				const routerInput = `${message.subject || ""}\n\n${
					message.body || message.snippet || ""
				}`;

				// message_id에 매칭되는 첨부파일들 조회
				const attachments = findAttachmentsByMessageId(message.message_id);
				const inputFilePaths = attachments.map((attachment) =>
					path.join(
						process.cwd(),
						FILE_PATH,
						`${message.message_id}/${attachment.file_name}`,
					),
				);

				const routerResult = await runRouterAgent(routerInput, inputFilePaths);
				const mailTitle =
					routerResult.mail_title || `Re: ${message.subject || "No Subject"}`;
				let replyBody = "";

				// RouterAgent 출력 스키마에 따른 처리
				if (routerResult.mail_body) {
					replyBody = routerResult.mail_body;
				} else {
					replyBody =
						"요청하신 내용을 처리하는 방법을 찾지 못했습니다. 다른 방식으로 문의해 주시기 바랍니다.";
				}

				// reply_mails 테이블에 답변 저장 (전송하지 않은 상태로)
				if (message.id) {
					createReplyMail({
						original_message_id: message.message_id,
						subject: mailTitle,
						reply_body: replyBody,
						attachments: JSON.stringify(routerResult.attachments ?? []),
						is_sent: false,
					});
				}

				// 답변 생성 성공 시 해당 메일을 읽음으로 표시
				if (gmailClient && message.message_id) {
					try {
						await gmailClient.markEmailAsRead(message.message_id);
						console.log(`메일 읽음 표시 완료: ${message.message_id}`);
					} catch (markReadError) {
						console.warn(
							`메일 읽음 표시 실패 (${message.message_id}):`,
							markReadError,
						);
						// 읽음 표시 실패는 전체 프로세스를 중단하지 않음
					}
				}

				successCount++;
				console.log(`답변 생성 완료: ${message.subject}`);
			} catch (error) {
				console.error(`메일 답변 생성 중 오류 (${message.id}):`, error);
				errorCount++;
			}
		}

		const finalProgress: GenerateRepliesProgress = {
			totalEmails: messages.length,
			processedEmails: messages.length,
			successCount,
			errorCount,
			status: "completed",
		};

		if (progressCallback) {
			progressCallback(finalProgress);
		}

		console.log(
			`답변 생성 완료: 총 ${messages.length}개, 성공 ${successCount}개, 실패 ${errorCount}개`,
		);

		return finalProgress;
	} catch (error) {
		console.error(`답변 생성 중 전체 오류:`, error);

		const errorProgress: GenerateRepliesProgress = {
			totalEmails: mailIds.length,
			processedEmails: 0,
			successCount: 0,
			errorCount: mailIds.length,
			status: "error",
		};

		if (progressCallback) {
			progressCallback(errorProgress);
		}

		throw error;
	}
}

/**
 * 답변 메일을 실제로 전송
 */
export async function sendReplyMail(replyMailId: number): Promise<boolean> {
	try {
		const replyMail = findReplyMailById(replyMailId);
		if (!replyMail) {
			throw new Error("Reply mail not found");
		}

		if (replyMail.is_sent) {
			throw new Error("Reply mail already sent");
		}

		const creds = await getCredentials();
		const service = buildGmailService(creds);
		const client = new GmailClient(service);

		console.log(
			`replyMailId: ${replyMailId} - ${replyMail.id} / ${replyMail.original_message_id} - ${replyMail.subject} - ${replyMail.reply_body}`,
		);
		// 원본 메시지 가져오기 (Gmail API에서)
		const originalMessageId = replyMail.original_message_id;
		if (!originalMessageId) {
			throw new Error("Original Gmail message ID not found");
		}

		const originalMessage = await client.getMessage(originalMessageId);

		// 첨부파일 파싱
		const attachments = replyMail.attachments
			? JSON.parse(replyMail.attachments)
			: [];

		// 답장 전송
		const sent = await client.sendReply(
			originalMessage,
			replyMail.reply_body,
			attachments,
		);

		// 전송 상태 업데이트
		const sentAt = new Date().toISOString();
		updateReplyMailSentStatus(replyMailId, true, sentAt);

		console.log(`답장 전송 완료: ${sent.id}`);
		return true;
	} catch (error) {
		console.error(`답장 전송 중 오류:`, error);
		throw error;
	}
}

interface GetReplyMailsOptions {
	unsentOnly?: boolean;
	limit?: number;
	messageId?: string;
}

/**
 * 답변 메일 목록 조회
 */
export function getReplyMails(options: GetReplyMailsOptions = {}) {
	const { unsentOnly = false, limit = 50, messageId } = options;

	if (messageId) {
		return {
			replyMails: findReplyMailsByMessageId(messageId, limit),
			totalCount: countReplyMailsByMessageId(messageId),
		};
	}

	if (unsentOnly) {
		return {
			replyMails: findReplyMailsByStatus(false, limit),
			totalCount: countUnsentReplyMails(),
		};
	}

	return {
			replyMails: findAllReplyMails(limit),
			totalCount: countReplyMails(),
	};
}

/**
 * 전체 답변 메일 개수 조회
 */
export function getTotalReplyMailsCount(): number {
	return countReplyMails();
}

/**
 * 미전송 답변 메일 개수 조회
 */
export function getUnsentReplyMailsCount(): number {
	return countUnsentReplyMails();
}

/**
 * 답변 메일 상세 조회
 */
export function getReplyMailById(id: number) {
	return findReplyMailById(id);
}

/**
 * 답변 메일 내용 업데이트 (미전송 메일만)
 */
export function updateReplyMail(
	id: number,
	subject: string,
	reply_body: string,
): boolean {
	try {
		// 먼저 해당 메일이 존재하고 미전송 상태인지 확인
		const existingMail = findReplyMailById(id);
		if (!existingMail) {
			throw new Error("Reply mail not found");
		}

		if (existingMail.is_sent) {
			throw new Error("Cannot update already sent mail");
		}

		// 빈 값 체크
		if (!subject.trim() || !reply_body.trim()) {
			throw new Error("Subject and reply body cannot be empty");
		}

		return updateReplyMailContent(id, subject.trim(), reply_body.trim());
	} catch (error) {
		console.error("Error updating reply mail:", error);
		throw error;
	}
}

/**
 * 답변 메일 삭제 (미전송 메일만)
 */
export function removeReplyMail(id: number): boolean {
	try {
		// 먼저 해당 메일이 존재하고 미전송 상태인지 확인
		const existingMail = findReplyMailById(id);
		if (!existingMail) {
			throw new Error("Reply mail not found");
		}

		if (existingMail.is_sent) {
			throw new Error("Cannot delete already sent mail");
		}

		return deleteReplyMail(id);
	} catch (error) {
		console.error("Error deleting reply mail:", error);
		throw error;
	}
}
