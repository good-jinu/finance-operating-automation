import { HumanMessage } from "@langchain/core/messages";
import { createCustomerDatabaseAgent } from "./workflow";

export const runCustomerDatabaseAgent = async (message: string) => {
	const agent = createCustomerDatabaseAgent();
	const result = await agent.invoke({
		messages: [new HumanMessage(message)],
	});
	return result;
};
