import { ClientPaymentSupportAgent } from "../agent";
import { findUnreadGmailMessages } from "../models/GmailMessage";
import {
	countReplyMails,
	countUnsentReplyMails,
	createReplyMail,
	findAllReplyMails,
	findReplyMailById,
	findReplyMailsByStatus,
	updateReplyMailSentStatus,
} from "../models/ReplyMail";
import { buildGmailService, getCredentials } from "./auth";
import { GmailClient } from "./gmailClient";

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

/**
 * DB에서 읽지 않은 메일에 대한 답변을 생성하여 reply_mails 테이블에 저장
 */
export async function generateRepliesForUnreadMails(
	progressCallback?: (progress: GenerateRepliesProgress) => void,
) {
	try {
		const writer = new ClientPaymentSupportAgent();
		const unreadMessages = findUnreadGmailMessages(50); // 최대 50개

		if (!unreadMessages || unreadMessages.length === 0) {
			console.log("읽지 않은 메일이 없습니다.");
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

		console.log(
			`읽지 않은 메일 ${unreadMessages.length}개에 대한 답변 생성 시작`,
		);

		for (let i = 0; i < unreadMessages.length; i++) {
			const message = unreadMessages[i];

			try {
				// 진행 상황 업데이트
				const progress: GenerateRepliesProgress = {
					totalEmails: unreadMessages.length,
					processedEmails: i,
					successCount,
					errorCount,
					status: "running",
					currentEmail: {
						subject: message.subject || "No Subject",
						sender: message.sender,
						status: "processing",
					},
				};

				if (progressCallback) {
					progressCallback(progress);
				}

				console.log(
					`답변 생성 중: ${message.subject || ""} (${i + 1}/${unreadMessages.length})`,
				);

				// AI가 답장 본문 작성
				const replyResult = await writer.generateReply(
					message.subject || "",
					message.body || message.snippet || "",
				);

				// reply_mails 테이블에 답변 저장 (전송하지 않은 상태로)
				if (message.id) {
					createReplyMail({
						original_message_id: message.id,
						subject: `Re: ${message.subject || "No Subject"}`,
						reply_body: replyResult.mail_body,
						attachments: JSON.stringify(replyResult.attachments),
						is_sent: false,
					});
				}

				successCount++;
				console.log(`답변 생성 완료: ${message.subject}`);

				if (progress.currentEmail) {
					progress.currentEmail.status = "success";
				}
			} catch (error) {
				console.error(`메일 답변 생성 중 오류 (${message.id}):`, error);
				errorCount++;

				const progress: GenerateRepliesProgress = {
					totalEmails: unreadMessages.length,
					processedEmails: i + 1,
					successCount,
					errorCount,
					status: "running",
					currentEmail: {
						subject: "Error processing email",
						sender: "Unknown",
						status: "error",
					},
				};

				if (progressCallback) {
					progressCallback(progress);
				}
			}
		}

		const finalProgress: GenerateRepliesProgress = {
			totalEmails: unreadMessages.length,
			processedEmails: unreadMessages.length,
			successCount,
			errorCount,
			status: "completed",
		};

		if (progressCallback) {
			progressCallback(finalProgress);
		}

		console.log(
			`답변 생성 완료: 총 ${unreadMessages.length}개, 성공 ${successCount}개, 실패 ${errorCount}개`,
		);

		return finalProgress;
	} catch (error) {
		console.error(`답변 생성 중 전체 오류:`, error);

		const errorProgress: GenerateRepliesProgress = {
			totalEmails: 0,
			processedEmails: 0,
			successCount: 0,
			errorCount: 1,
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

		// 원본 메시지 가져오기 (Gmail API에서)
		const originalMessageId = await getOriginalGmailMessageId(
			replyMail.original_message_id,
		);
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

/**
 * 답변 메일 목록 조회 (전송 상태별)
 */
export function getReplyMails(unsentOnly: boolean = false, limit: number = 50) {
	if (unsentOnly) {
		return {
			replyMails: findReplyMailsByStatus(false, limit),
			totalCount: countUnsentReplyMails(),
		};
	} else {
		return {
			replyMails: findAllReplyMails(limit),
			totalCount: countReplyMails(),
		};
	}
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
 * DB의 gmail_messages에서 Gmail API message_id 가져오기
 */
async function getOriginalGmailMessageId(
	dbMessageId: number,
): Promise<string | null> {
	const db = require("../database").default;
	const stmt = db.prepare("SELECT message_id FROM gmail_messages WHERE id = ?");
	const result = stmt.get(dbMessageId) as { message_id: string } | null;
	return result?.message_id || null;
}
