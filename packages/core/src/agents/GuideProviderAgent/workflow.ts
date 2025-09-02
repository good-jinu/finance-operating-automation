import { END, START, StateGraph } from "@langchain/langgraph";
import { extractTopicNode, findGuideNode } from "./nodes";
import { GuideProviderStateAnnotation } from "./schemas";

const workflow = new StateGraph(GuideProviderStateAnnotation)
	.addNode("extractTopic", extractTopicNode)
	.addNode("findGuide", findGuideNode)
	.addEdge(START, "extractTopic")
	.addEdge("extractTopic", "findGuide")
	.addEdge("findGuide", END);

export const createGuideProviderAgent = () => workflow.compile();
