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
		const result = await this.workflow.invoke({
			messages: [new HumanMessage(message)],
		});

		if (!result.mail_body) {
			throw new Error("메일 본문을 생성할 수 없습니다.");
		}

		return {
			mail_body: result.mail_body,
			attachments: result.attachments || [],
		};
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
