import { ClientPaymentSupportAgent } from "../agent";
import {
	type AutoReplySession,
	createAutoReplySession,
	findActiveAutoReplySession,
	findAutoReplySessionBySessionId,
	updateAutoReplySessionProgress,
	updateAutoReplySessionStatus,
} from "../models/AutoReplySession";
import {
	createEmailLog,
	findEmailLogByEmailId,
	findRecentEmailLogs,
	updateEmailLogStatus,
} from "../models/EmailLog";
import { DEFAULT_QUERY } from "../utils/config";
import { buildGmailService, getCredentials } from "./auth";
import { GmailClient } from "./gmailClient";

export interface ReplyProgress {
	sessionId: string;
	totalEmails: number;
	processedEmails: number;
	successCount: number;
	errorCount: number;
	status: "running" | "completed" | "stopped" | "error";
	currentEmail?: {
		subject: string;
		sender: string;
		status: "processing" | "success" | "error";
	};
}

/**
 * 읽지 않은 메일 목록을 출력하고 각 메일에 자동으로 답장을 보냅니다.
 * @param progressCallback 진행 상황을 알려주는 콜백 함수
 */
export async function replyUnreadMail(
	progressCallback?: (progress: ReplyProgress) => void,
) {
	const sessionId = `session_${Date.now()}`;
	let session: AutoReplySession | null = null;

	try {
		const creds = await getCredentials();
		const service = buildGmailService(creds);
		const client = new GmailClient(service);
		const writer = new ClientPaymentSupportAgent();

		const messages = await client.listUnreadMessages("me", DEFAULT_QUERY);

		if (!messages || messages.length === 0) {
			console.log("읽지 않은 메일이 없습니다.");
			return {
				sessionId,
				totalEmails: 0,
				processedEmails: 0,
				successCount: 0,
				errorCount: 0,
				status: "completed" as const,
			};
		}

		// 세션 생성
		session = createAutoReplySession({
			session_id: sessionId,
			status: "running",
			total_emails: messages.length,
			processed_emails: 0,
			success_count: 0,
			error_count: 0,
		});

		let successCount = 0;
		let errorCount = 0;

		console.log(`읽지 않은 메일 ${messages.length}개 처리 시작`);

		for (let i = 0; i < messages.length; i++) {
			const meta = messages[i];
			if (!meta.id) continue;

			try {
				const msg = await client.getMessage(meta.id);
				const summary = client.getMessageSummary(msg);

				// 발신자 정보 추출
				const headers = msg.payload?.headers || [];
				const fromHeader =
					headers.find((h) => h.name?.toLowerCase() === "from")?.value ||
					"Unknown";

				// 이메일 로그 생성
				const emailLog = createEmailLog({
					email_id: meta.id,
					sender: fromHeader,
					subject: summary.subject || "No Subject",
					body: summary.body,
					status: "processing",
				});

				// 진행 상황 업데이트
				const progress: ReplyProgress = {
					sessionId,
					totalEmails: messages.length,
					processedEmails: i,
					successCount,
					errorCount,
					status: "running",
					currentEmail: {
						subject: summary.subject || "No Subject",
						sender: fromHeader,
						status: "processing",
					},
				};

				if (progressCallback) {
					progressCallback(progress);
				}

				console.log(
					`처리 중: ${summary.subject || ""} (${i + 1}/${messages.length})`,
				);

				// AI가 답장 본문 작성
				const replyResult = await writer.generateReply(
					summary.subject || "",
					summary.body || "",
				);

				// 답장 전송
				const sent = await client.sendReply(
					msg,
					replyResult.mail_body,
					replyResult.attachments,
				);

				// 성공 로그 업데이트
				if (emailLog && emailLog.id !== null && emailLog.id !== undefined) {
					updateEmailLogStatus(
						emailLog.id,
						"success",
						replyResult.mail_body,
						JSON.stringify(replyResult.attachments),
					);
				}

				successCount++;
				console.log(`답장 전송 완료: ${sent.id}`);

				if (progress.currentEmail) {
					progress.currentEmail.status = "success";
				}
			} catch (error) {
				console.error(`메일 처리 중 오류 (${meta.id}):`, error);

				// 오류 로그 업데이트
				const emailLog = findEmailLogByEmailId(meta.id);
				if (emailLog && emailLog.id !== null && emailLog.id !== undefined) {
					updateEmailLogStatus(
						emailLog.id,
						"error",
						undefined,
						undefined,
						error instanceof Error ? error.message : String(error),
					);
				}

				errorCount++;

				const progress: ReplyProgress = {
					sessionId,
					totalEmails: messages.length,
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

			// 세션 진행 상황 업데이트
			updateAutoReplySessionProgress(
				sessionId,
				i + 1,
				successCount,
				errorCount,
			);
		}

		// 세션 완료
		updateAutoReplySessionStatus(sessionId, "completed");

		const finalProgress: ReplyProgress = {
			sessionId,
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
			`처리 완료: 총 ${messages.length}개, 성공 ${successCount}개, 실패 ${errorCount}개`,
		);

		return finalProgress;
	} catch (error) {
		console.error(`전체 처리 중 오류:`, error);

		if (session) {
			updateAutoReplySessionStatus(sessionId, "error");
		}

		const errorProgress: ReplyProgress = {
			sessionId,
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
 * 활성 자동 답변 세션 정보를 가져옵니다.
 */
export function getActiveSession() {
	return findActiveAutoReplySession();
}

/**
 * 세션 ID로 세션 정보를 가져옵니다.
 */
export function getSessionById(sessionId: string) {
	return findAutoReplySessionBySessionId(sessionId);
}

/**
 * 최근 이메일 로그를 가져옵니다.
 */
export function getRecentEmailLogs(limit: number = 10) {
	return findRecentEmailLogs(limit);
}
