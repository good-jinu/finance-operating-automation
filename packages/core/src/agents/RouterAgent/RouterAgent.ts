import { HumanMessage } from "@langchain/core/messages";
import { createRouterAgent } from "./workflow";

export const runRouterAgent = async (
	message: string,
	inputFilePath?: string,
) => {
	const agent = createRouterAgent();
	const result = await agent.invoke({
		messages: [new HumanMessage(message)],
		input_filepath: inputFilePath,
	});
	return result;
};
