import { HumanMessage } from "@langchain/core/messages";
import { createFileReaderAgent } from "./workflow";

export const runFileReaderAgent = async (
	message: string,
	filepaths: string[],
) => {
	const agent = createFileReaderAgent();
	const result = await agent.invoke({
		messages: [new HumanMessage(message)],
		filepaths: filepaths,
	});
	return result;
};
