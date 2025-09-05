import { HumanMessage } from "@langchain/core/messages";
import { MemorySaver } from "@langchain/langgraph";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { createChatModel } from "../../llm";
import { chatAgentTools } from "./tools";

// 메모리 저장소 초기화 (대화 히스토리 관리)
const checkpointer = new MemorySaver();

// LLM 모델 초기화 (Ollama midm-2.0-base 사용)
const model = createChatModel();

// ReAct Agent 생성
const agent = createReactAgent({
	llm: model,
	tools: chatAgentTools,
	checkpointSaver: checkpointer,
});

/**
 * 시스템 프롬프트 - ChatAgent의 역할과 도구 사용 가이드
 */
const SYSTEM_PROMPT = `
당신은 한국 금융기관의 고객 지원 AI 어시스턴트입니다. 고객의 요청을 이해하고 적절한 도구를 사용하여 도움을 제공해야 합니다.

## 주요 기능:
1. **이메일 관리**: Gmail 메일 목록 조회, 답장 메일 관리
2. **회사 정보**: 고객 회사 정보 검색
3. **수권자 관리**: 수권자 정보 조회 및 변경
4. **결제계좌 관리**: 결제계좌 정보 조회 및 변경  
5. **인감/서명 관리**: 인감/서명 정보 조회 및 변경

## 사용 가능한 도구:
- **gmail_list**: Gmail 메일 목록 조회 (읽지 않은 메일, 전체 메일)
- **reply_mail_list**: 답장 메일 목록 조회 (발송됨/미발송 필터 가능)
- **company_search**: 회사 정보 검색 (정확한 회사명 또는 전체 목록)
- **authorized_person**: 수권자 정보 조회/변경 (이름, 이메일, 전화번호)
- **payment_account**: 결제계좌 정보 조회/변경 (계좌번호, 예금주, 은행명)
- **official_seal**: 인감/서명 정보 조회/변경 (파일 경로)

## 도구 사용 규칙:
1. 도구를 호출할 때는 반드시 JSON 형식으로 파라미터를 전달하세요.
2. 회사명은 정확해야 하므로, 불확실한 경우 company_search로 먼저 확인하세요.
3. 데이터 변경 전에는 항상 현재 정보를 조회하여 확인하세요.
4. 오류가 발생한 경우 사용자에게 명확하게 설명하세요.

## 응답 가이드:
- 한국어로 정중하게 응답하세요.
- 기술적인 용어보다는 쉬운 말로 설명하세요.
- 작업 완료 후 결과를 요약해서 알려주세요.
- 필요한 경우 추가 도움을 제안하세요.
`;

/**
 * ChatAgent 인터페이스
 */
export interface ChatAgentConfig {
	thread_id?: string;
	max_iterations?: number;
	recursion_limit?: number;
}

/**
 * ChatAgent와 대화하기 위한 메인 함수
 */
export async function invokeChatAgent(
	message: string,
	config: ChatAgentConfig = {},
) {
	const {
		thread_id = "default",
		max_iterations = 5,
		recursion_limit = 10,
	} = config;

	try {
		// 시스템 프롬프트와 사용자 메시지를 함께 전달
		const messages = [
			new HumanMessage(SYSTEM_PROMPT),
			new HumanMessage(message),
		];

		const response = await agent.invoke(
			{ messages },
			{
				configurable: { thread_id },
				recursionLimit: recursion_limit,
			},
		);

		// 마지막 AI 메시지 반환
		const lastMessage = response.messages[response.messages.length - 1];
		return {
			success: true,
			content: lastMessage.content,
			message_count: response.messages.length,
			thread_id,
		};
	} catch (error) {
		console.error("ChatAgent 실행 중 오류 발생:", error);
		return {
			success: false,
			error: `ChatAgent 실행 중 오류가 발생했습니다: ${error}`,
			thread_id,
		};
	}
}

/**
 * ChatAgent와 연속 대화를 위한 함수
 */
export async function continueChatAgent(
	message: string,
	thread_id: string,
	config: Omit<ChatAgentConfig, "thread_id"> = {},
) {
	return await invokeChatAgent(message, { ...config, thread_id });
}

/**
 * 대화 히스토리를 초기화하는 함수
 */
export async function resetChatAgent(thread_id: string) {
	try {
		// MemorySaver는 직접적인 삭제 메소드를 제공하지 않으므로
		// 새로운 빈 상태로 초기화
		await agent.invoke(
			{ messages: [new HumanMessage("대화를 초기화합니다.")] },
			{ configurable: { thread_id } },
		);

		return {
			success: true,
			message: "대화 히스토리가 초기화되었습니다.",
			thread_id,
		};
	} catch (error) {
		return {
			success: false,
			error: `대화 초기화 중 오류가 발생했습니다: ${error}`,
			thread_id,
		};
	}
}

/**
 * ChatAgent 스트리밍 함수
 */
export async function* streamChatAgent(
	message: string,
	config: ChatAgentConfig = {},
) {
	const {
		thread_id = "default",
		max_iterations = 5,
		recursion_limit = 10,
	} = config;

	try {
		// 시스템 프롬프트와 사용자 메시지를 함께 전달
		const messages = [
			new HumanMessage(SYSTEM_PROMPT),
			new HumanMessage(message),
		];

		// 스트리밍 호출
		const stream = await agent.stream(
			{ messages },
			{
				configurable: { thread_id },
				recursionLimit: recursion_limit,
				streamMode: "updates",
			},
		);

		// 스트림 청크를 yield
		for await (const chunk of stream) {
			yield {
				success: true,
				chunk,
				thread_id,
			};
		}
	} catch (error) {
		console.error("ChatAgent 스트리밍 중 오류 발생:", error);
		yield {
			success: false,
			error: `ChatAgent 스트리밍 중 오류가 발생했습니다: ${error}`,
			thread_id: config.thread_id || "default",
		};
	}
}

/**
 * ChatAgent 연속 스트리밍 함수
 */
export async function* streamContinueChatAgent(
	message: string,
	thread_id: string,
	config: Omit<ChatAgentConfig, "thread_id"> = {},
) {
	yield* streamChatAgent(message, { ...config, thread_id });
}

/**
 * ChatAgent 기본 내보내기
 */
export { agent as chatAgent };
export default {
	invoke: invokeChatAgent,
	continue: continueChatAgent,
	reset: resetChatAgent,
	stream: streamChatAgent,
	streamContinue: streamContinueChatAgent,
	agent,
};
