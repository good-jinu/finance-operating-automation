import { END } from "@langchain/langgraph";
import { createChatModel } from "../../llm";
import {
	emailGenerationPrompts,
	guideTypeSelectorPrompts,
	plannerPrompts,
	routerPrompts,
} from "./prompts";
import {
	type AgentState,
	EmailResponseSchema,
	GuideTypeSchema,
	RouteSchema,
} from "./schemas";

const model = createChatModel();

// 1. Planner Node: Interprets the user's message and creates a plan.
export const plannerNode = async (state: AgentState) => {
	const userInput =
		state.messages[state.messages.length - 1].content?.toString() ?? "";
	const response = await model.invoke([
		plannerPrompts.system,
		plannerPrompts.human(userInput),
	]);
	return { plan: response.content.toString() };
};

// 2. Router Node: Decides the next step based on the plan.
export const conditionalRouter = async (state: AgentState) => {
	try {
		const routerModel = model.withStructuredOutput(RouteSchema, {
			name: "route_decision",
		});

		const result = await routerModel.invoke([
			routerPrompts.system,
			routerPrompts.human(state.plan),
		]);

		const destination = result?.destination || "end";
		return destination === "change_guide" ? "change_guide" : END;
	} catch (error) {
		console.warn(
			"라우팅 결정 중 오류가 발생했습니다. 기본값으로 END를 반환합니다:",
			error,
		);
		return END;
	}
};

type GuideType =
	| "authority change"
	| "payment account change"
	| "seal sign change";

// Helper function to determine the guide type
async function determineGuideType(
	plan: string,
	lastMessage: string,
): Promise<GuideType> {
	const guideSelector = createChatModel().withStructuredOutput(
		GuideTypeSchema,
		{
			name: "guide_type_selection",
		},
	);

	const result = await guideSelector.invoke([
		guideTypeSelectorPrompts.system,
		guideTypeSelectorPrompts.human(plan, lastMessage),
	]);

	return result?.guide_type || "authority change";
}

const guideContentMap = {
	"authority change": {
		guide: "수권자 변경은 첨부파일의 양식을 채워서 보내면 됩니다.",
		attachments: ["authority_change.docx"],
	},
	"payment account change": {
		guide: "결제계좌 변경은 첨부파일의 양식을 채워서 보내면 됩니다.",
		attachments: ["payment_account_change.docx"],
	},
	"seal sign change": {
		guide: "인감 및 서명 변경은 첨부파일의 양식을 채워서 보내면 됩니다.",
		attachments: ["seal_sign_change.docx"],
	},
};

// Helper function to generate the final email
async function generateFinalEmail(
	lastMessage: string,
	mailGuide: string,
): Promise<string> {
	const guideModel = createChatModel().withStructuredOutput(
		EmailResponseSchema,
	);

	const result = await guideModel.invoke([
		emailGenerationPrompts.system,
		emailGenerationPrompts.human(lastMessage, mailGuide),
	]);

	return (
		result?.mail_body ||
		`안녕하세요.

고객님의 요청에 대해 안내드립니다.

${mailGuide}

추가 문의사항이 있으시면 언제든 연락해주세요.

감사합니다.`
	);
}

// 3. Change Guide Node: Generates the final email response with the guide.
export const changeGuideNode = async (state: AgentState) => {
	const lastMessage =
		state.messages[state.messages.length - 1].content?.toString() ?? "";

	// 1. Determine guide type
	const guideType = await determineGuideType(state.plan, lastMessage);

	// 2. Get guide content and attachments
	const { guide, attachments } = guideContentMap[guideType];

	// 3. Generate email body
	const mailBody = await generateFinalEmail(lastMessage, guide);

	return { mail_body: mailBody, attachments };
};
