import { HumanMessage } from "@langchain/core/messages";
import { createRouterAgent } from "./workflow";

export const runRouterAgent = async (
	message: string,
	inputFilePaths?: string[],
) => {
	const agent = createRouterAgent();
	const result = await agent.invoke({
		messages: [new HumanMessage(message)],
		input_filepaths: inputFilePaths,
	});
	return result;
};

export const streamRouterAgent = async (
	message: string,
	inputFilePaths: string[] = [],
) => {
	const agent = createRouterAgent();
	return agent.stream(
		{
			messages: [new HumanMessage(message)],
			input_filepaths: inputFilePaths,
		},
		{ streamMode: "updates" },
	);
};
