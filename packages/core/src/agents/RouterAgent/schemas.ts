import type { BaseMessage } from "@langchain/core/messages";
import { Annotation } from "@langchain/langgraph";
import { z } from "zod";

// 하위 에이전트 설정 타입
export interface SubAgentConfig {
	name: string;
	description: string;
	// biome-ignore lint:suspicious/noExplicitAny
	workflow: any; // 실제 워크플로 인스턴스
	// biome-ignore lint:suspicious/noExplicitAny
	stateMapper?: (state: RouterState) => any; // 상태 변환 함수
	outputMapper?: (
		// biome-ignore lint:suspicious/noExplicitAny
		state: any,
	) => Pick<RouterState, "messages" | "attachments">;
}

export const RouteDecisionSchema = z.object({
	route: z.string(),
});

export const MailWriterSchema = z.object({
	title: z.string().describe("메일의 제목"),
	body: z.string().describe("메일의 본문"),
});

export const RouterStateAnnotation = Annotation.Root({
	// 입력 state
	messages: Annotation<BaseMessage[]>({
		reducer: (a, b) => a.concat(b),
		default: () => [],
	}),
	input_filepaths: Annotation<string[]>({
		reducer: (x, y) => x.concat(y),
		default: () => [],
	}),

	// 추론 state
	description: Annotation<string>({
		reducer: (x, y) => y ?? x,
		default: () => "",
	}),

	// 출력 state
	mail_title: Annotation<string>({
		reducer: (x, y) => y ?? x,
		default: () => "",
	}),
	mail_body: Annotation<string>({
		reducer: (x, y) => y ?? x,
		default: () => "",
	}),
	attachments: Annotation<string[]>({
		reducer: (x, y) => x.concat(y),
		default: () => [],
	}),
});

export type RouterState = typeof RouterStateAnnotation.State;
