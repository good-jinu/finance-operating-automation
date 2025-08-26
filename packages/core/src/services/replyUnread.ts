import { ClientPaymentSupportAgent } from "../agent";
import { DEFAULT_QUERY } from "../utils/config";
import { buildGmailService, getCredentials } from "./auth";
import { GmailClient } from "./gmailClient";

/**
 * 읽지 않은 메일 목록을 출력하고 각 메일에 자동으로 답장을 보냅니다.
 */
export async function main() {
	try {
		const creds = await getCredentials();
		const service = buildGmailService(creds);
		const client = new GmailClient(service);
		const writer = new ClientPaymentSupportAgent();

		const messages = await client.listUnreadMessages("me", DEFAULT_QUERY);

		if (!messages || messages.length === 0) {
			console.log("읽지 않은 메일이 없습니다.");
			return;
		}

		console.log("읽지 않은 메일 목록:");
		for (const meta of messages) {
			if (!meta.id) continue;

			const msg = await client.getMessage(meta.id);
			const summary = client.getMessageSummary(msg);

			console.log(`- 제목: ${summary.subject || ""}`);
			console.log(`  ID: ${summary.id || ""}`);
			console.log(`  body: ${summary.body || ""}`);

			// AI가 답장 본문 작성
			const replyResult = await writer.generateReply(
				summary.subject || "",
				summary.body || "",
			);

			const sent = await client.sendReply(msg, replyResult.mail_body);
			console.log(`답장 메일 전송 완료. 메시지 ID: ${sent.id}`);
			if (replyResult.attachments.length > 0) {
				console.log(`첨부파일: ${replyResult.attachments.join(", ")}`);
			}
		}
	} catch (error) {
		console.error(`An error occurred: ${error}`);
	}
}
