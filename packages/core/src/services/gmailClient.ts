import type { gmail_v1 } from "googleapis";
import {
	createGmailMessage,
	findGmailMessageByMessageId,
	findRecentGmailMessages,
	findUnreadGmailMessages,
	type GmailMessage,
} from "../models/GmailMessage";
import { readAttachments } from "../utils/fileReader";
import {
	extractEmail,
	extractTextFromPayload,
	getHeader,
} from "../utils/mailParser";
import { buildGmailService, getCredentials } from "./auth";

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

		const to = extractEmail(fromAddress);

		let rawMessage: string;

		if (attachments && attachments.length > 0) {
			const boundary = `mixed_${Math.random().toString(36).slice(2)}`;
			const attachmentInfos = readAttachments(attachments);

			const messageParts: string[] = [
				`From: ${userId}`,
				`To: ${to}`,
				`Subject: ${replySubject}`,
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
				`Subject: ${replySubject}`,
				`In-Reply-To: ${originalMessageId}`,
				`References: ${originalMessageId}`,
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
	): Promise<{ synced: number; skipped: number; errors: number }> {
		let synced = 0;
		let skipped = 0;
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
					// 이미 DB에 존재하는 메시지인지 확인
					const existingMessage = findGmailMessageByMessageId(messageRef.id);
					if (existingMessage) {
						skipped++;
						continue;
					}

					// Gmail에서 전체 메시지 정보를 가져옵니다
					const fullMessage = await this.getMessage(messageRef.id, userId);

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
						labels: JSON.stringify(fullMessage.labelIds || []),
						internal_date: fullMessage.internalDate || "",
						size_estimate: fullMessage.sizeEstimate || 0,
						is_unread: fullMessage.labelIds?.includes("UNREAD") || false,
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

		return { synced, skipped, errors };
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
}
