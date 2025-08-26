import {
	type BaseMessage,
	HumanMessage,
	SystemMessage,
} from "@langchain/core/messages";
import { Annotation, END, START, StateGraph } from "@langchain/langgraph";
import { z } from "zod";
import { createChatModel } from "../llm";

/**
 * 메일 응답 구조
 */
export const EmailResponseSchema = z.object({
	mail_body: z.string().describe("메일 본문 내용"),
});

// Define the state for our graph
const AgentStateAnnotation = Annotation.Root({
	messages: Annotation<BaseMessage[]>({
		reducer: (a, b) => a.concat(b),
		default: () => [],
	}),
	plan: Annotation<string>({
		reducer: (_, y) => y,
		default: () => "",
	}),
	mail_body: Annotation<string>({
		reducer: (_, y) => y,
		default: () => "",
	}),
	attachments: Annotation<string[]>({
		reducer: (a, b) => a.concat(b),
		default: () => [],
	}),
	// The output of the router node will be the route destination.
	route_destination: Annotation<"change_guide" | "end">({
		reducer: (_, y) => y,
		default: () => "end",
	}),
});

// Schema for the router's structured output
const RouteSchema = z.object({
	destination: z
		.enum(["change_guide", "end"])
		.describe("The destination to route to, based on the task."),
});

/**
 * 고객 결제 지원 에이전트 워크플로우를 생성합니다.
 */
export function createClientPaymentSupportWorkflow() {
	const model = createChatModel();

	// 1. Planner Node: Interprets the user's message and creates a plan.
	const plannerNode = async (state: typeof AgentStateAnnotation.State) => {
		const response = await model.invoke([
			new SystemMessage(`당신은 고객 지원 에이전트를 위한 플래너입니다.
최신 사용자 메시지를 기반으로 수행할 작업을 설명하는 간결한 한 문장의 계획을 작성하세요.
예를 들어, 사용자가 "담당자를 변경하려면 어떻게 해야 하나요?"라고 물으면, 계획은 "수권자 변경에 대한 가이드 제공"이 될 수 있습니다.
사용자의 요청이 불분명하거나 결제 지원과 관련이 없는 경우, 계획은 "요청을 처리할 수 없다고 정중하게 알림"이 되어야 합니다.`),
			new HumanMessage(
				state.messages[state.messages.length - 1].content?.toString() ?? "",
			),
		]);
		return { plan: response.content.toString() };
	};

	// Conditional Edge Logic: Returns the name of the next node.
	const conditionalRouter = async (
		state: typeof AgentStateAnnotation.State,
	) => {
		try {
			const routerModel = model.withStructuredOutput(RouteSchema, {
				name: "route_decision",
			});

			const result = await routerModel.invoke([
				new SystemMessage(`당신은 고객 지원 시스템의 라우터입니다.
주어진 계획(Plan)을 분석하여 다음 중 하나를 선택하십시오:
- "change_guide": 수권자/대표자/담당자 변경, 인감/서명 변경, 결제 계좌 변경과 관련된 안내가 필요한 경우
- "end": 그 외의 모든 경우 (일반적인 문의, 처리 불가능한 요청 등)

반드시 JSON 형식으로 응답하고, destination 필드에 "change_guide" 또는 "end" 중 하나만 입력하십시오.`),
				new HumanMessage(`계획: "${state.plan}"`),
			]);

			const destination = result?.destination || "end";

			if (destination === "end") {
				return END;
			}
			return destination === "change_guide" ? "change_guide" : END;
		} catch (error) {
			console.warn(
				"라우팅 결정 중 오류가 발생했습니다. 기본값으로 END를 반환합니다:",
				error,
			);
			return END;
		}
	};

	// 3. Change Guide Node: Generates the final email response with the guide.
	const changeGuideNode = async (state: typeof AgentStateAnnotation.State) => {
		let guide_type:
			| "authority change"
			| "payment account change"
			| "seal sign change" = "authority change";

		try {
			const GuideTypeSchema = z.object({
				guide_type: z
					.enum([
						"authority change",
						"payment account change",
						"seal sign change",
					])
					.describe("제공할 가이드의 유형"),
			});

			const guideSelector = createChatModel().withStructuredOutput(
				GuideTypeSchema,
				{
					includeRaw: true,
					name: "guide_type_selection",
				},
			);

			const result = await guideSelector.invoke([
				new SystemMessage(`당신은 고객 지원 시스템의 가이드 타입 분석기입니다.
고객의 요청을 분석하여 다음 중 하나의 가이드 타입을 선택하십시오:

- "authority change": 수권자, 대표자, 담당자 변경과 관련된 요청
- "payment account change": 결제 계좌, 계좌 정보 변경과 관련된 요청  
- "seal sign change": 인감, 서명, 도장 변경과 관련된 요청

반드시 JSON 형식으로 응답하고, guide_type 필드에 위 3개 중 하나만 정확히 입력하십시오.`),
				new HumanMessage(`계획: "${state.plan}"
고객의 메시지: "${state.messages[state.messages.length - 1].content}"`),
			]);

			guide_type = result.parsed?.guide_type || "authority change";
		} catch (error) {
			console.warn(
				"가이드 타입 선택 중 오류가 발생했습니다. 기본값(authority change)을 사용합니다:",
				error,
			);
			guide_type = "authority change";
		}

		let mailGuide: string = "";
		let attachments: string[] = [];

		switch (guide_type) {
			case "authority change":
				mailGuide = "수권자 변경은 첨부파일의 양식을 채워서 보내면 됩니다.";
				attachments = ["authority_change.docx"];
				break;
			case "payment account change":
				mailGuide = "결제계좌 변경은 첨부파일의 양식을 채워서 보내면 됩니다.";
				attachments = ["payment_account_change.docx"];
				break;
			case "seal sign change":
				mailGuide =
					"인감 및 서명 변경은 첨부파일의 양식을 채워서 보내면 됩니다.";
				attachments = ["seal_sign_change.docx"];
				break;
		}

		try {
			const guideModel = createChatModel().withStructuredOutput(
				EmailResponseSchema,
				{
					name: "email_response",
				},
			);

			const result = await guideModel.invoke([
				new SystemMessage(`당신은 친절하고 전문적인 고객 지원 담당자입니다.
고객의 요청에 대해 도움이 되는 이메일 응답을 작성해주십시오.

다음 사항을 포함하여 완전하고 정중한 한국어 이메일을 작성하세요:
1. 정중한 인사말
2. 고객의 요청에 대한 이해 표시
3. 제공된 가이드 정보
4. 추가 문의 시 연락 방법 안내
5. 정중한 마무리 인사

반드시 JSON 형식으로 응답하고, mail_body 필드에 완성된 이메일 내용을 입력하십시오.`),
				new HumanMessage(`고객의 메시지: "${state.messages[state.messages.length - 1].content}"
제공할 가이드: ${mailGuide}`),
			]);

			const mail_body =
				result?.mail_body ||
				`안녕하세요.

고객님의 요청에 대해 안내드립니다.

${mailGuide}

추가 문의사항이 있으시면 언제든 연락해주세요.

감사합니다.`;

			return { mail_body, attachments };
		} catch (error) {
			console.warn(
				"이메일 생성 중 오류가 발생했습니다. 기본 응답을 사용합니다:",
				error,
			);
			const defaultMailBody = `안녕하세요.

고객님의 요청에 대해 안내드립니다.

${mailGuide}

추가 문의사항이 있으시면 언제든 연락해주세요.

감사합니다.`;

			return { mail_body: defaultMailBody, attachments };
		}
	};

	// Define the graph structure
	const workflow = new StateGraph(AgentStateAnnotation)
		.addNode("planner", plannerNode)
		.addNode("change_guide", changeGuideNode)
		.addEdge(START, "planner")
		.addConditionalEdges("planner", conditionalRouter)
		.addEdge("change_guide", END);

	return workflow.compile();
}

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
	 * @param threadId 스레드 ID (옵션)
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
