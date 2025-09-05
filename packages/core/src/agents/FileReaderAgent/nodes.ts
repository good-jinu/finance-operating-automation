import { DocxLoader } from "@langchain/community/document_loaders/fs/docx";
import { createChatModel } from "../../llm";
import { FILE_READER_PROMPT } from "./prompts";
import type { FileReaderState } from "./schemas";

const model = createChatModel();

export const extractFileNode = async (
	state: FileReaderState,
): Promise<Partial<FileReaderState>> => {
	const docs = [];
	for (const filepath of state.filepaths) {
		if (!filepath) {
			continue;
		}
		const loader = new DocxLoader(filepath);

		docs.push(await loader.load());
	}

	return {
		content: docs[0]?.[0]?.pageContent ?? "",
	};
};

export const summarizeContentNode = async (
	state: FileReaderState,
): Promise<Partial<FileReaderState>> => {
	if (!state.content) {
		throw new Error("No content to summarize.");
	}

	const summary = await model.invoke(
		await FILE_READER_PROMPT.invoke({
			content: state.content,
		}),
	);
	console.log(summary);

	return {
		description: summary.content.toString(),
	};
};
