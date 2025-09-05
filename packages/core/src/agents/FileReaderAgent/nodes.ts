import { DocxLoader } from "@langchain/community/document_loaders/fs/docx";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { AIMessage } from "@langchain/core/messages";
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

		// 파일 확장자에 따라 적절한 로더 선택
		const fileExtension = filepath.toLowerCase().split(".").pop();
		let loader: DocxLoader | PDFLoader;

		if (fileExtension === "pdf") {
			loader = new PDFLoader(filepath);
		} else if (fileExtension === "docx") {
			loader = new DocxLoader(filepath);
		} else {
			console.warn(`지원하지 않는 파일 형식: ${fileExtension}`);
			continue;
		}

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
		messages: [new AIMessage(summary.content.toString())],
	};
};
