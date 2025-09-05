import { END, START, StateGraph } from "@langchain/langgraph";
import {
	analyzeAuthorizedPersonRequest,
	analyzeOfficialSealRequest,
	analyzePaymentAccountRequest,
	executeUpdate,
	routeRequest,
} from "./nodes";
import {
	type CustomerDatabaseState,
	CustomerDatabaseStateAnnotation,
} from "./schemas";

// 라우팅 조건 함수
const routeToSpecificAnalysis = (state: CustomerDatabaseState) => {
	switch (state.update_type) {
		case "authorized_person":
			return "analyzeAuthorizedPerson";
		case "payment_account":
			return "analyzePaymentAccount";
		case "official_seal":
			return "analyzeOfficialSeal";
		default:
			return END;
	}
};

export const createCustomerDatabaseAgent = () => {
	const workflow = new StateGraph(CustomerDatabaseStateAnnotation)
		.addNode("routeRequest", routeRequest)
		.addNode("analyzeAuthorizedPerson", analyzeAuthorizedPersonRequest)
		.addNode("analyzePaymentAccount", analyzePaymentAccountRequest)
		.addNode("analyzeOfficialSeal", analyzeOfficialSealRequest)
		.addNode("executeUpdate", executeUpdate)
		.addConditionalEdges("routeRequest", routeToSpecificAnalysis)
		.addEdge("analyzeAuthorizedPerson", "executeUpdate")
		.addEdge("analyzePaymentAccount", "executeUpdate")
		.addEdge("analyzeOfficialSeal", "executeUpdate")
		.addEdge("executeUpdate", END)
		.addEdge(START, "routeRequest");

	return workflow.compile();
};
