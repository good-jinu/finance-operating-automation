import { ChatOllama } from "@langchain/ollama";

const DEFAULT_MODEL_NAME = "midm-2.0-base";

/**
 * ChatOllama 모델을 생성하는 팩토리 함수
 */
export function createChatModel(): ChatOllama {
	return new ChatOllama({
		model: DEFAULT_MODEL_NAME,
	});
}
