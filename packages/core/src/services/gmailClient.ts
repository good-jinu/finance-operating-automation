import type { gmail_v1 } from "googleapis";
import {
	decodeBase64UrlSafe,
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
		userId: string = "me",
	): Promise<gmail_v1.Schema$Message> {
		const headers = originalMessage.payload?.headers || [];
		const subject = decodeBase64UrlSafe(getHeader(headers, "Subject") || "");
		const fromAddress = getHeader(headers, "From") || "";
		const originalMessageId = getHeader(headers, "Message-ID") || "";

		const replySubject = subject.toLowerCase().startsWith("re:")
			? subject
			: `Re: ${subject}`;

		console.log(
			`userId: ${userId}, fromAddress: ${fromAddress}, replySubject: ${replySubject}, originalMessageId: ${originalMessageId}, replyBody: ${replyBody}`,
		);
		const rawMessage = [
			`From: ${userId}`,
			`To: ${extractEmail(fromAddress)}`,
			`Subject: ${replySubject}`,
			`In-Reply-To: ${originalMessageId}`,
			`References: ${originalMessageId}`,
			"",
			replyBody,
		].join("\n");

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
