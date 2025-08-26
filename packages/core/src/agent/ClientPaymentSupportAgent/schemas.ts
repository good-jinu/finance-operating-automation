import type { BaseMessage } from "@langchain/core/messages";
import { Annotation } from "@langchain/langgraph";
import { z } from "zod";

/**
 * 메일 응답 구조
 */
export const EmailResponseSchema = z.object({
	mail_body: z.string().describe("메일 본문 내용"),
});

/**
 * 라우터의 구조화된 출력 스키마
 */
export const RouteSchema = z.object({
	destination: z
		.enum(["change_guide", "end"])
		.describe("The destination to route to, based on the task."),
});

/**
 * 가이드 유형 스키마
 */
export const GuideTypeSchema = z.object({
	guide_type: z
		.enum(["authority change", "payment account change", "seal sign change"])
		.describe("제공할 가이드의 유형"),
});

// Define the state for our graph
export const AgentStateAnnotation = Annotation.Root({
	messages: Annotation<BaseMessage[]>({
		reducer: (a, b) => a.concat(b),
		default: () => [],
	}),
	plan: Annotation<string>({
		reducer: (_, y) => y,
		default: () => "",
	}),
	mail_body: Annotation<string>({
		reducer: (_, y) => y,
		default: () => "",
	}),
	attachments: Annotation<string[]>({
		reducer: (a, b) => a.concat(b),
		default: () => [],
	}),
	// The output of the router node will be the route destination.
	route_destination: Annotation<"change_guide" | "end">({
		reducer: (_, y) => y,
		default: () => "end",
	}),
});

export type AgentState = typeof AgentStateAnnotation.State;
