import { createChatModel } from "../../llm";
import { GUIDE_PROVIDER_PROMPT } from "./prompts";
import { type GuideProviderState, TopicSchema } from "./schemas";

const model = createChatModel();

const GUIDE_FILES: Record<string, string> = {
	authority_change: "authority_change.docx",
	payment_account_change: "payment_account_change.docx",
	seal_sign_change: "seal_sign_change.docx",
};

export const extractTopicNode = async (
	state: GuideProviderState,
): Promise<Partial<GuideProviderState>> => {
	const topicModel = model.withStructuredOutput(TopicSchema);

	const message = state.messages[state.messages.length - 1].content.toString();

	const result = await topicModel.invoke(
		await GUIDE_PROVIDER_PROMPT.invoke({ message: message }),
	);

	return {
		topic: result.topic,
	};
};

export const findGuideNode = async (
	state: GuideProviderState,
): Promise<Partial<GuideProviderState>> => {
	const filePath = GUIDE_FILES[state.topic];
	if (!filePath) {
		throw new Error(`Could not find a guide for topic: ${state.topic}`);
	}

	return {
		attachment: filePath,
	};
};
