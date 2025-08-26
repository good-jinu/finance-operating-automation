import { END, START, StateGraph } from "@langchain/langgraph";
import { changeGuideNode, conditionalRouter, plannerNode } from "./nodes";
import { AgentStateAnnotation } from "./schemas";

/**
 * 고객 결제 지원 에이전트 워크플로우를 생성합니다.
 */
export function createClientPaymentSupportWorkflow() {
	// Define the graph structure
	const workflow = new StateGraph(AgentStateAnnotation)
		.addNode("planner", plannerNode)
		.addNode("change_guide", changeGuideNode)
		.addEdge(START, "planner")
		.addConditionalEdges("planner", conditionalRouter)
		.addEdge("change_guide", END);

	return workflow.compile();
}
