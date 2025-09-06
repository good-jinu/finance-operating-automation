import { createChatModel } from "../../llm";
import { GUIDE_PROVIDER_PROMPT } from "./prompts";
import { type GuideProviderState, TopicSchema } from "./schemas";

const model = createChatModel();

const GUIDE: Record<string, { description: string; attachment: string }> = {
	authority_change: {
		description:
			"수권자 변경을 위해서는 첨부파일의 양식에 맞추어 고객의 정보를 모두 작성하고 서명한 뒤에 메일로 다시 보내야합니다.",
		attachment: "authority_change.docx",
	},
	payment_account_change: {
		description:
			"결제계좌 변경을 위해서는 첨부파일의 양식에 맞추어 고객의 정보를 모두 작성하고 서명한 뒤에 메일로 다시 보내야합니다.",
		attachment: "payment_account_change.docx",
	},
	seal_sign_change: {
		description:
			"서명 변경을 위해서는 첨부파일의 양식에 맞추어 고객의 정보를 모두 작성하고 서명한 뒤에 메일로 다시 보내야합니다.",
		attachment: "seal_sign_change.docx",
	},
};

export const extractTopicNode = async (
	state: GuideProviderState,
): Promise<Partial<GuideProviderState>> => {
	console.log("🔍 [GuideProvider] 토픽 추출 노드 시작");
	const topicModel = model.withStructuredOutput(TopicSchema);

	const message = state.messages[state.messages.length - 1].content.toString();
	console.log(`🤖 [GuideProvider] LLM 호출하여 토픽 추출, 메시지: ${message}`);

	const result = await topicModel.invoke(
		await GUIDE_PROVIDER_PROMPT.invoke({ message: message }),
	);

	console.log(`✅ [GuideProvider] 토픽 추출 완료: ${result.topic}`);
	return {
		topic: result.topic,
	};
};

export const findGuideNode = async (
	state: GuideProviderState,
): Promise<Partial<GuideProviderState>> => {
	console.log(`📚 [GuideProvider] 가이드 검색 노드 시작, 토픽: ${state.topic}`);
	const guide = GUIDE[state.topic];
	if (!guide) {
		console.error(`❌ [GuideProvider] 토픽에 대한 가이드를 찾을 수 없음: ${state.topic}`);
		throw new Error(`Could not find a guide for topic: ${state.topic}`);
	}

	console.log(
		`✅ [GuideProvider] 가이드 검색 완료, 첨부파일: ${guide.attachment}`,
	);
	return {
		description: guide.description,
		attachment: guide.attachment,
	};
};
