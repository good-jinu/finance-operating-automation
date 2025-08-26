import { HumanMessage } from "@langchain/core/messages";
import { createClientPaymentSupportWorkflow } from "./workflow";

/**
 * 고객 결제 지원 에이전트
 */
export class ClientPaymentSupportAgent {
	private workflow: ReturnType<typeof createClientPaymentSupportWorkflow>;

	constructor() {
		this.workflow = createClientPaymentSupportWorkflow();
	}

	/**
	 * 고객 요청을 처리합니다.
	 * @param message 고객 메시지
	 * @returns 메일 본문과 첨부파일
	 */
	async processCustomerRequest(
		message: string,
	): Promise<{ mail_body: string; attachments: string[] }> {
		try {
			const result = await this.workflow.invoke({
				messages: [new HumanMessage(message)],
			});

			return {
				mail_body: result.mail_body || this.getDefaultResponse(),
				attachments: result.attachments || [],
			};
		} catch (error) {
			console.error("고객 요청 처리 중 오류가 발생했습니다:", error);
			return {
				mail_body: this.getDefaultResponse(),
				attachments: [],
			};
		}
	}

	/**
	 * 기본 응답 메시지를 반환합니다.
	 * @returns 기본 응답 메시지
	 */
	private getDefaultResponse(): string {
		return `안녕하세요.

죄송합니다. 현재 시스템 오류로 인해 요청을 정확히 처리할 수 없습니다.

불편을 끼쳐드려 죄송하며, 직접 고객센터로 연락해주시면 신속히 도움을 드리겠습니다.

감사합니다.`;
	}

	/**
	 * 메일 답장을 생성합니다.
	 * @param subject 메일 제목
	 * @param body 메일 본문
	 * @param fromEmail 발신자 이메일 (옵션)
	 * @returns 메일 본문과 첨부파일
	 */
	async generateReply(
		subject: string,
		body: string,
		fromEmail?: string,
	): Promise<{ mail_body: string; attachments: string[] }> {
		const message = `메일 제목: ${subject}\n메일 내용: ${body}${fromEmail ? `\n발신자: ${fromEmail}` : ""}`;
		return this.processCustomerRequest(message);
	}
}
