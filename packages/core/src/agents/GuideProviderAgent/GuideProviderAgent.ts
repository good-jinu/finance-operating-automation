import { HumanMessage } from "@langchain/core/messages";
import { createGuideProviderAgent } from "./workflow";

export const runGuideProviderAgent = async (message: string) => {
	const agent = createGuideProviderAgent();
	const result = await agent.invoke({ messages: [new HumanMessage(message)] });
	return result;
};
