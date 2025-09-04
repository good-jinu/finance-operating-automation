import { END, StateGraph } from "@langchain/langgraph";
import { analyzeRequest, executeUpdate } from "./nodes";
import {
	CustomerDatabaseStateAnnotation,
} from "./schemas";

export const createCustomerDatabaseAgent = () => {
	const workflow = new StateGraph(CustomerDatabaseStateAnnotation)
		.addNode("analyzeRequest", analyzeRequest)
		.addNode("executeUpdate", executeUpdate)
		.addEdge("analyzeRequest", "executeUpdate")
		.addEdge("executeUpdate", END)
		.setEntryPoint("analyzeRequest");

	return workflow.compile();
};
