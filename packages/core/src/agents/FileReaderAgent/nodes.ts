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
	console.log("📄 [FileReader] 파일 추출 노드 시작");
	const docs = [];
	for (const filepath of state.filepaths) {
		if (!filepath) {
			continue;
		}

		console.log(`📄 [FileReader] 파일 로딩 중: ${filepath}`);
		// 파일 확장자에 따라 적절한 로더 선택
		const fileExtension = filepath.toLowerCase().split(".").pop();
		let loader: DocxLoader | PDFLoader;

		if (fileExtension === "pdf") {
			loader = new PDFLoader(filepath);
		} else if (fileExtension === "docx") {
			loader = new DocxLoader(filepath);
		} else {
			console.warn(`⚠️ [FileReader] 지원하지 않는 파일 형식: ${fileExtension}`);
			continue;
		}

		docs.push(await loader.load());
	}

	const content = docs[0]?.[0]?.pageContent ?? "";
	console.log(
		`✅ [FileReader] 파일 추출 완료, 내용 길이: ${content.length}`,
	);

	return {
		content: content,
	};
};

export const summarizeContentNode = async (
	state: FileReaderState,
): Promise<Partial<FileReaderState>> => {
	console.log("📝 [FileReader] 내용 요약 노드 시작");
	if (!state.content) {
		console.error("❌ [FileReader] 요약할 내용이 없습니다.");
		throw new Error("No content to summarize.");
	}

	console.log("🤖 [FileReader] LLM 호출하여 요약 시작");
	const summary = await model.invoke(
		await FILE_READER_PROMPT.invoke({
			content: state.content,
		}),
	);
	console.log("✅ [FileReader] LLM 요약 완료:", summary.content.toString());

	return {
		messages: [new AIMessage(summary.content.toString())],
	};
};
