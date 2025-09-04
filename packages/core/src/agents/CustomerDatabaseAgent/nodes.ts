import { AIMessage, HumanMessage } from "@langchain/core/messages";
import {
	findAuthorizedPersonById,
	updateAuthorizedPerson,
} from "../../models/AuthorizedPerson";
import {
	findOfficialSealById,
	updateOfficialSeal,
} from "../../models/OfficialSeal";
import {
	findPaymentAccountById,
	updatePaymentAccount,
} from "../../models/PaymentAccount";
import { CUSTOMER_DATABASE_AGENT_PROMPT } from "./prompts";
import type { CustomerDatabaseState } from "./schemas";
import {createChatModel} from "../../llm";

const model = createChatModel();

export const analyzeRequest = async (
	state: CustomerDatabaseState,
): Promise<CustomerDatabaseState> => {
	// content가 있다면 파일에서 읽은 내용을 사용, 없다면 마지막 메시지 사용
	const contentToAnalyze =
		state.content || state.messages[state.messages.length - 1]?.content || "";

	const analysisPrompt = `
${CUSTOMER_DATABASE_AGENT_PROMPT}

사용자 요청을 분석하여 다음을 결정하세요:
1. 변경 유형 (authorized_person, payment_account, official_seal 중 하나)
2. 변경할 데이터 (ID와 업데이트할 필드들)

분석할 내용: ${contentToAnalyze}

응답 형식:
{
  "update_type": "authorized_person|payment_account|official_seal",
  "update_data": {
    "id": 숫자,
    "필드명": "변경값"
  }
}
`;

	const result = await model.invoke([new HumanMessage(analysisPrompt)]);

	try {
		const parsedResult = JSON.parse(result.content as string);
		return {
			...state,
			update_type: parsedResult.update_type,
			update_data: parsedResult.update_data,
		};
	} catch (error) {
		return {
			...state,
			description: "요청을 분석하는 중 오류가 발생했습니다.",
		};
	}
};

export const executeUpdate = async (
	state: CustomerDatabaseState,
): Promise<CustomerDatabaseState> => {
	if (!state.update_type || !state.update_data) {
		return {
			...state,
			description: "업데이트 정보가 부족합니다.",
		};
	}

	try {
		let success = false;
		let resultMessage = "";

		switch (state.update_type) {
			case "authorized_person": {
				const { id: personId, ...personData } = state.update_data;
				const existingPerson = findAuthorizedPersonById(personId);

				if (!existingPerson) {
					resultMessage = `ID ${personId}에 해당하는 수권자를 찾을 수 없습니다.`;
					break;
				}

				success = updateAuthorizedPerson(personId, personData);
				resultMessage = success
					? `수권자 정보가 성공적으로 업데이트되었습니다. (ID: ${personId})`
					: "수권자 정보 업데이트에 실패했습니다.";
				break;
			}

			case "payment_account": {
				const { id: accountId, ...accountData } = state.update_data;
				const existingAccount = findPaymentAccountById(accountId);

				if (!existingAccount) {
					resultMessage = `ID ${accountId}에 해당하는 결제계좌를 찾을 수 없습니다.`;
					break;
				}

				success = updatePaymentAccount(accountId, accountData);
				resultMessage = success
					? `결제계좌 정보가 성공적으로 업데이트되었습니다. (ID: ${accountId})`
					: "결제계좌 정보 업데이트에 실패했습니다.";
				break;
			}

			case "official_seal": {
				const { id: sealId, ...sealData } = state.update_data;
				const existingSeal = findOfficialSealById(sealId);

				if (!existingSeal) {
					resultMessage = `ID ${sealId}에 해당하는 인감을 찾을 수 없습니다.`;
					break;
				}

				success = updateOfficialSeal(sealId, sealData);
				resultMessage = success
					? `인감/서명 정보가 성공적으로 업데이트되었습니다. (ID: ${sealId})`
					: "인감/서명 정보 업데이트에 실패했습니다.";
				break;
			}

			default:
				resultMessage = "지원하지 않는 업데이트 유형입니다.";
		}

		return {
			...state,
			description: resultMessage,
			messages: [...state.messages, new AIMessage(resultMessage)],
		};
	} catch (error) {
		const errorMessage = `데이터베이스 업데이트 중 오류가 발생했습니다: ${error}`;
		return {
			...state,
			description: errorMessage,
			messages: [...state.messages, new AIMessage(errorMessage)],
		};
	}
};
