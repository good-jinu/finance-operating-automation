import type { BaseMessage } from "@langchain/core/messages";
import { Annotation } from "@langchain/langgraph";
import { z } from "zod";

/**
 * 라우터의 구조화된 출력 스키마
 */
export const TopicSchema = z.object({
	topic: z
		.enum(["authority_change", "payment_account_change", "seal_sign_change"])
		.describe("The topic of the guide to provide."),
});

// Define the state for our graph
export const GuideProviderStateAnnotation = Annotation.Root({
	messages: Annotation<BaseMessage[]>({
		reducer: (a, b) => a.concat(b),
		default: () => [],
	}),
	topic: Annotation<string>({
		reducer: (_, y) => y,
		default: () => "",
	}),
	description: Annotation<string>({
		reducer: (x, y) => y ?? x,
		default: () => "",
	}),
	attachment: Annotation<string>({
		reducer: (_, y) => y,
		default: () => "",
	}),
});

export type GuideProviderState = typeof GuideProviderStateAnnotation.State;
