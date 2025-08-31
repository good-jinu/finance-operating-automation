import type { gmail_v1 } from "googleapis";
import {
	createGmailMessage,
	findGmailMessageByMessageId,
	findRecentGmailMessages,
	findUnreadGmailMessages,
	type GmailMessage,
	updateGmailMessageLabelsAndReadStatus,
} from "../models/GmailMessage";
import { readAttachments } from "../utils/fileReader";
import {
	extractEmail,
	extractTextFromPayload,
	getHeader,
} from "../utils/mailParser";
import { buildGmailService, getCredentials } from "./auth";

/**
 * Subject를 RFC 2047 형식으로 인코딩합니다.
 * 한글이나 기타 비ASCII 문자가 포함된 제목이 깨지지 않도록 처리합니다.
 */
function encodeSubject(subject: string): string {
	// ASCII 문자만 있는 경우 인코딩하지 않음
	if (/^[\x20-\x7E]*$/.test(subject)) {
		return subject;
	}

	// UTF-8로 인코딩하고 Base64로 변환 후 RFC 2047 형식으로 래핑
	const encodedSubject = `=?UTF-8?B?${Buffer.from(subject, "utf-8").toString("base64")}?=`;
	return encodedSubject;
}

/**
 * Gmail 클라이언트를 생성합니다.
 * 인증, 서비스 구축, 클라이언트 인스턴스 생성을 한 번에 처리합니다.
 */
export async function createGmailClient(): Promise<GmailClient> {
	const creds = await getCredentials();
	const service = buildGmailService(creds);
	return new GmailClient(service);
}

export type MessageSummary = {
	id: string | null | undefined;
	threadId: string | null | undefined;
	subject: string | undefined;
	body: string;
};

export class GmailClient {
	constructor(private service: gmail_v1.Gmail) {}

	/**
	 * 읽지 않은 메일 목록의 message 메타데이터(id, threadId)를 반환합니다.
	 */
	async listUnreadMessages(
		userId: string = "me",
		query: string = "is:unread",
	): Promise<gmail_v1.Schema$Message[]> {
		const response = await this.service.users.messages.list({
			userId,
			q: query,
		});
		return response.data.messages || [];
	}

	/**
	 * 지정된 메시지를 full 포맷으로 가져옵니다.
	 */
	async getMessage(
		messageId: string,
		userId: string = "me",
	): Promise<gmail_v1.Schema$Message> {
		const response = await this.service.users.messages.get({
			userId,
			id: messageId,
			format: "full",
		});
		return response.data;
	}

	/**
	 * 메시지에서 제목/본문 요약을 구성합니다.
	 */
	getMessageSummary(message: gmail_v1.Schema$Message): MessageSummary {
		const headers = message.payload?.headers || [];
		const subject = getHeader(headers, "Subject");
		const body = extractTextFromPayload(message.payload || {});
		return {
			id: message.id,
			threadId: message.threadId,
			subject,
			body,
		};
	}

	/**
	 * 주어진 원본 메시지에 대한 답장을 발송합니다.
	 */
	async sendReply(
		originalMessage: gmail_v1.Schema$Message,
		replyBody: string,
		attachments: string[] = [],
		userId: string = "me",
	): Promise<gmail_v1.Schema$Message> {
		const headers = originalMessage.payload?.headers || [];
		const subject = getHeader(headers, "Subject") || "";
		const fromAddress = getHeader(headers, "From") || "";
		const originalMessageId = getHeader(headers, "Message-ID") || "";

		const replySubject = subject.toLowerCase().startsWith("re:")
			? subject
			: `Re: ${subject}`;

		// Subject를 RFC 2047 형식으로 인코딩
		const encodedReplySubject = encodeSubject(replySubject);

		const to = extractEmail(fromAddress);

		let rawMessage: string;

		if (attachments && attachments.length > 0) {
			const boundary = `mixed_${Math.random().toString(36).slice(2)}`;
			const attachmentInfos = readAttachments(attachments);

			const messageParts: string[] = [
				`From: ${userId}`,
				`To: ${to}`,
				`Subject: ${encodedReplySubject}`,
				`In-Reply-To: ${originalMessageId}`,
				`References: ${originalMessageId}`,
				"MIME-Version: 1.0",
				`Content-Type: multipart/mixed; boundary="${boundary}"`,
				"",
				`--${boundary}`,
				'Content-Type: text/plain; charset="UTF-8"',
				"MIME-Version: 1.0",
				"Content-Transfer-Encoding: 7bit",
				"",
				replyBody,
				"",
			];

			for (const attachment of attachmentInfos) {
				messageParts.push(
					`--${boundary}`,
					`Content-Type: ${attachment.mimeType}`,
					"MIME-Version: 1.0",
					"Content-Transfer-Encoding: base64",
					`Content-Disposition: attachment; filename="${attachment.fileName}"`,
					"",
					attachment.fileData,
					"",
				);
			}

			messageParts.push(`--${boundary}--`);
			rawMessage = messageParts.join("\n");
		} else {
			rawMessage = [
				`From: ${userId}`,
				`To: ${to}`,
				`Subject: ${encodedReplySubject}`,
				`In-Reply-To: ${originalMessageId}`,
				`References: ${originalMessageId}`,
				'Content-Type: text/plain; charset="UTF-8"',
				"MIME-Version: 1.0",
				"",
				replyBody,
			].join("\n");
		}

		const encodedMessage = Buffer.from(rawMessage)
			.toString("base64")
			.replace(/\+/g, "-")
			.replace(/\//g, "_")
			.replace(/=+$/, "");

		const response = await this.service.users.messages.send({
			userId,
			requestBody: {
				raw: encodedMessage,
				threadId: originalMessage.threadId,
			},
		});

		return response.data;
	}

	/**
	 * Gmail의 메일들을 DB에 동기화합니다. 중복된 메일은 건너뜁니다.
	 */
	async syncMails(
		userId: string = "me",
		query: string = "",
		maxResults: number = 100,
	): Promise<{
		synced: number;
		skipped: number;
		updated: number;
		errors: number;
	}> {
		let synced = 0;
		let skipped = 0;
		let updated = 0;
		let errors = 0;

		try {
			// Gmail에서 메시지 목록을 가져옵니다
			const response = await this.service.users.messages.list({
				userId,
				q: query,
				maxResults,
			});

			const messages = response.data.messages || [];

			for (const messageRef of messages) {
				if (!messageRef.id) continue;

				try {
					// Gmail에서 전체 메시지 정보를 가져옵니다
					const fullMessage = await this.getMessage(messageRef.id, userId);

					// 현재 Gmail 메시지의 상태
					const currentLabels = JSON.stringify(fullMessage.labelIds || []);
					const currentIsUnread =
						fullMessage.labelIds?.includes("UNREAD") || false;

					// 이미 DB에 존재하는 메시지인지 확인
					const existingMessage = findGmailMessageByMessageId(messageRef.id);
					if (existingMessage) {
						// labels와 is_unread 상태가 변경되었는지 확인
						const labelsChanged = existingMessage.labels !== currentLabels;
						const unreadChanged = existingMessage.is_unread !== currentIsUnread;

						if (labelsChanged || unreadChanged) {
							// 변경사항이 있으면 DB 업데이트
							const updateSuccess = updateGmailMessageLabelsAndReadStatus(
								messageRef.id,
								currentLabels,
								currentIsUnread,
							);
							if (updateSuccess) {
								updated++;
							} else {
								console.warn(`메시지 ${messageRef.id} 업데이트 실패`);
								errors++;
							}
						} else {
							skipped++;
						}
						continue;
					}

					// 메시지 정보를 파싱합니다
					const headers = fullMessage.payload?.headers || [];
					const subject = getHeader(headers, "Subject") || "";
					const from = getHeader(headers, "From") || "";
					const to = getHeader(headers, "To") || "";
					const body = extractTextFromPayload(fullMessage.payload || {});

					// 첨부파일 여부 확인
					const hasAttachments = this.checkHasAttachments(fullMessage.payload);

					// DB에 저장할 메시지 객체 생성
					const gmailMessage: Omit<
						GmailMessage,
						"id" | "created_at" | "updated_at"
					> = {
						message_id: fullMessage.id || "",
						thread_id: fullMessage.threadId || "",
						subject,
						sender: extractEmail(from) || from,
						recipient: extractEmail(to) || to,
						body,
						snippet: fullMessage.snippet || "",
						labels: currentLabels,
						internal_date: fullMessage.internalDate || "",
						size_estimate: fullMessage.sizeEstimate || 0,
						is_unread: currentIsUnread,
						has_attachments: hasAttachments,
					};

					// DB에 저장
					createGmailMessage(gmailMessage);
					synced++;
				} catch (error) {
					console.error(`메시지 ${messageRef.id} 동기화 중 오류 발생:`, error);
					errors++;
				}
			}
		} catch (error) {
			console.error("Gmail 메일 동기화 중 오류 발생:", error);
			throw error;
		}

		return { synced, skipped, updated, errors };
	}

	/**
	 * DB에 저장된 메일 목록을 조회합니다.
	 */
	async getMailsFromDatabase(
		limit: number = 50,
		offset: number = 0,
		isUnreadOnly?: boolean,
	): Promise<GmailMessage[]> {
		if (isUnreadOnly) {
			return findUnreadGmailMessages(limit, offset);
		}

		return findRecentGmailMessages(limit);
	}

	/**
	 * 특정 이메일에서 UNREAD 라벨을 제거하여 읽음으로 표시합니다.
	 */
	async markEmailAsRead(
		messageId: string,
		userId: string = "me",
	): Promise<gmail_v1.Schema$Message> {
		try {
			const response = await this.service.users.messages.modify({
				userId,
				id: messageId,
				requestBody: {
					removeLabelIds: ["UNREAD"],
				},
			});

			// Gmail API 호출 성공 시 DB도 업데이트
			try {
				const updatedLabels = JSON.stringify(response.data.labelIds || []);
				const updateSuccess = updateGmailMessageLabelsAndReadStatus(
					messageId,
					updatedLabels,
					false, // is_unread = false (읽음)
				);

				if (updateSuccess) {
					console.log(`DB 업데이트 성공: ${messageId} - 읽음으로 표시됨`);
				} else {
					console.warn(
						`DB 업데이트 실패: ${messageId} - 메시지가 DB에 존재하지 않을 수 있습니다`,
					);
				}
			} catch (dbError) {
				console.error(`DB 업데이트 중 오류 발생 (${messageId}):`, dbError);
				// DB 업데이트 실패는 Gmail API 성공을 방해하지 않음
			}

			console.log(`이메일이 읽음으로 처리되었습니다: ${messageId}`);
			return response.data;
		} catch (error) {
			console.error(
				`이메일을 읽음으로 처리하는 중 오류 발생 (${messageId}):`,
				error,
			);
			throw error;
		}
	}

	/**
	 * 메시지에 첨부파일이 있는지 확인합니다.
	 */
	private checkHasAttachments(payload?: gmail_v1.Schema$MessagePart): boolean {
		if (!payload) return false;

		// 현재 부분에 첨부파일이 있는지 확인
		if (payload.filename && payload.filename.length > 0) {
			return true;
		}

		// 중첩된 부분들도 재귀적으로 확인
		if (payload.parts) {
			return payload.parts.some((part) => this.checkHasAttachments(part));
		}

		return false;
	}

	/**
	 * 메시지에서 특정 파일명의 첨부파일을 찾습니다.
	 */
	private findAttachment(
		parts: gmail_v1.Schema$MessagePart[],
		filename: string,
	): gmail_v1.Schema$MessagePart | undefined {
		for (const part of parts) {
			if (
				part.filename === decodeURIComponent(filename) &&
				part.body?.attachmentId
			) {
				return part;
			}
			if (part.parts) {
				const found = this.findAttachment(part.parts, filename);
				if (found) return found;
			}
		}
		return undefined;
	}

	/**
	 * 첨부파일을 다운로드합니다.
	 */
	async downloadAttachment(
		messageId: string,
		filename: string,
		userId: string = "me",
	): Promise<{
		buffer: Buffer;
		contentType: string;
		filename: string;
	}> {
		try {
			// 메시지 상세 정보 가져오기
			const message = await this.service.users.messages.get({
				userId,
				id: messageId,
			});

			if (!message.data.payload?.parts) {
				throw new Error("첨부파일을 찾을 수 없습니다");
			}

			// 첨부파일 찾기
			const attachment = this.findAttachment(
				message.data.payload.parts,
				filename,
			);

			if (!attachment || !attachment.body?.attachmentId) {
				throw new Error("첨부파일을 찾을 수 없습니다");
			}

			// 첨부파일 데이터 가져오기
			const attachmentData = await this.service.users.messages.attachments.get({
				userId,
				messageId: messageId,
				id: attachment.body.attachmentId,
			});

			if (!attachmentData.data.data) {
				throw new Error("첨부파일 데이터를 가져올 수 없습니다");
			}

			// Base64 디코딩
			const buffer = Buffer.from(attachmentData.data.data, "base64url");

			// Content-Type 결정
			const contentType = attachment.mimeType || "application/octet-stream";

			return {
				buffer,
				contentType,
				filename: attachment.filename || filename,
			};
		} catch (error) {
			console.error(
				`첨부파일 다운로드 중 오류 (${messageId}/${filename}):`,
				error,
			);
			throw error;
		}
	}
}
