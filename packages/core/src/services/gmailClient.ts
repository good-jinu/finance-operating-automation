import * as fs from "node:fs";
import * as path from "node:path";
import type { gmail_v1 } from "googleapis";
import { FILE_PATH } from "../utils/config";
import {
	extractEmail,
	extractTextFromPayload,
	getHeader,
} from "../utils/mailParser";

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

		// 간단한 MIME 타입 결정 함수
		function getMimeType(filePath: string): string {
			const ext = path.extname(filePath).toLowerCase();
			switch (ext) {
				case ".txt":
					return "text/plain";
				case ".pdf":
					return "application/pdf";
				case ".jpg":
				case ".jpeg":
					return "image/jpeg";
				case ".png":
					return "image/png";
				case ".gif":
					return "image/gif";
				case ".webp":
					return "image/webp";
				case ".csv":
					return "text/csv";
				case ".json":
					return "application/json";
				case ".zip":
					return "application/zip";
				default:
					return "application/octet-stream";
			}
		}

		let rawMessage: string;

		if (attachments && attachments.length > 0) {
			const boundary = `mixed_${Math.random().toString(36).slice(2)}`;

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

			for (const filePath of attachments) {
				const fixedFilePath = path.join(process.cwd(), FILE_PATH, filePath);
				try {
					const fileName = path.basename(filePath);
					const mimeType = getMimeType(fixedFilePath);
					const fileData = fs.readFileSync(fixedFilePath).toString("base64");

					messageParts.push(
						`--${boundary}`,
						`Content-Type: ${mimeType}`,
						"MIME-Version: 1.0",
						"Content-Transfer-Encoding: base64",
						`Content-Disposition: attachment; filename="${fileName}"`,
						"",
						fileData,
						"",
					);
				} catch (err) {
					console.error(`첨부파일 읽기 오류 (${fixedFilePath}):`, err);
				}
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
}
