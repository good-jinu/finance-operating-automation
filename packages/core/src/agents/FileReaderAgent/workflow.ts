import { END, START, StateGraph } from "@langchain/langgraph";
import { extractFileNode, summarizeContentNode } from "./nodes";
import { FileReaderStateAnnotation } from "./schemas";

const workflow = new StateGraph(FileReaderStateAnnotation)
	.addNode("extractFile", extractFileNode)
	.addNode("summarizeContent", summarizeContentNode)
	.addEdge(START, "extractFile")
	.addEdge("extractFile", "summarizeContent")
	.addEdge("summarizeContent", END);

export const createFileReaderAgent = () => workflow.compile();
