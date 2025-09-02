import type { BaseMessage } from "@langchain/core/messages";
import { Annotation } from "@langchain/langgraph";

// Define the state for our graph
export const FileReaderStateAnnotation = Annotation.Root({
	messages: Annotation<BaseMessage[]>({
		reducer: (a, b) => a.concat(b),
		default: () => [],
	}),
	filepaths: Annotation<string[]>({
		reducer: (x, y) => x.concat(y),
		default: () => [],
	}),
	content: Annotation<string>({
		reducer: (_, y) => y,
		default: () => "",
	}),
	description: Annotation<string>({
		reducer: (x, y) => y ?? x,
		default: () => "",
	}),
});

export type FileReaderState = typeof FileReaderStateAnnotation.State;
