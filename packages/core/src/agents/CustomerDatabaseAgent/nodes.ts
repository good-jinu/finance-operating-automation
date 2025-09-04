import { AIMessage, HumanMessage } from "@langchain/core/messages";
import { createChatModel } from "../../llm";
import {
	findAuthorizedPersonById,
	findAuthorizedPersonByName,
	searchAuthorizedPersonsByName,
	updateAuthorizedPerson,
} from "../../models/AuthorizedPerson";
import {
	findCustomerCompanyByName,
	searchCustomerCompaniesByName,
} from "../../models/CustomerCompany";
import {
	findOfficialSealById,
	findLatestOfficialSealByCompanyId,
	updateOfficialSeal,
} from "../../models/OfficialSeal";
import {
	findPaymentAccountById,
	findPaymentAccountByAccountNumber,
	findPaymentAccountByAccountHolder,
	searchPaymentAccountsByBankName,
	updatePaymentAccount,
} from "../../models/PaymentAccount";
import { CUSTOMER_DATABASE_AGENT_PROMPT } from "./prompts";
import type { CustomerDatabaseState } from "./schemas";

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
2. 검색에 필요한 식별자와 업데이트할 필드들

분석할 내용: ${contentToAnalyze}

응답 형식:
{
  "update_type": "authorized_person|payment_account|official_seal",
  "search_criteria": {
    "company_name": "회사명" (필수),
    "person_name": "수권자명" (authorized_person인 경우),
    "account_number": "계좌번호" (payment_account인 경우),
    "account_holder": "예금주명" (payment_account인 경우),
    "bank_name": "은행명" (payment_account인 경우)
  },
  "update_data": {
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
			search_criteria: parsedResult.search_criteria,
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
	if (!state.update_type || !state.search_criteria || !state.update_data) {
		return {
			...state,
			description: "업데이트에 필요한 정보가 부족합니다.",
		};
	}

	try {
		let success = false;
		let resultMessage = "";
		const { company_name } = state.search_criteria;

		// 1. 먼저 회사를 찾습니다
		const company = findCustomerCompanyByName(company_name);
		if (!company) {
			return {
				...state,
				description: `회사 '${company_name}'을(를) 찾을 수 없습니다.`,
				messages: [...state.messages, new AIMessage(`회사 '${company_name}'을(를) 찾을 수 없습니다.`)],
			};
		}

		switch (state.update_type) {
			case "authorized_person": {
				const { person_name } = state.search_criteria;
				if (!person_name) {
					resultMessage = "수권자명이 제공되지 않았습니다.";
					break;
				}

				const existingPerson = findAuthorizedPersonByName(person_name, company.id);
				if (!existingPerson) {
					resultMessage = `회사 '${company_name}'에서 수권자 '${person_name}'을(를) 찾을 수 없습니다.`;
					break;
				}

				success = updateAuthorizedPerson(existingPerson.id!, state.update_data);
				resultMessage = success
					? `수권자 '${person_name}'의 정보가 성공적으로 업데이트되었습니다.`
					: `수권자 '${person_name}'의 정보 업데이트에 실패했습니다.`;
				break;
			}

			case "payment_account": {
				const { account_number, account_holder, bank_name } = state.search_criteria;
				let existingAccount = null;

				// 계좌번호로 찾기
				if (account_number) {
					existingAccount = findPaymentAccountByAccountNumber(account_number, company.id);
				}
				// 예금주명으로 찾기
				else if (account_holder) {
					existingAccount = findPaymentAccountByAccountHolder(account_holder, company.id);
				}
				// 은행명으로 검색
				else if (bank_name) {
					const accounts = searchPaymentAccountsByBankName(bank_name, company.id);
					if (accounts.length > 0) {
						existingAccount = accounts[0]; // 가장 최근 등록된 계좌 사용
					}
				}

				if (!existingAccount) {
					const searchInfo = account_number ? `계좌번호 '${account_number}'` : 
									   account_holder ? `예금주 '${account_holder}'` :
									   bank_name ? `은행 '${bank_name}'` : "지정된 조건";
					resultMessage = `회사 '${company_name}'에서 ${searchInfo}에 해당하는 결제계좌를 찾을 수 없습니다.`;
					break;
				}

				success = updatePaymentAccount(existingAccount.id!, state.update_data);
				const accountInfo = account_number ? `계좌번호 '${account_number}'` : 
								    account_holder ? `예금주 '${account_holder}'` :
								    `ID ${existingAccount.id}`;
				resultMessage = success
					? `결제계좌 (${accountInfo})의 정보가 성공적으로 업데이트되었습니다.`
					: `결제계좌 (${accountInfo})의 정보 업데이트에 실패했습니다.`;
				break;
			}

			case "official_seal": {
				const existingSeal = findLatestOfficialSealByCompanyId(company.id!);
				if (!existingSeal) {
					resultMessage = `회사 '${company_name}'에 등록된 인감을 찾을 수 없습니다.`;
					break;
				}

				success = updateOfficialSeal(existingSeal.id!, state.update_data);
				resultMessage = success
					? `회사 '${company_name}'의 인감/서명 정보가 성공적으로 업데이트되었습니다.`
					: `회사 '${company_name}'의 인감/서명 정보 업데이트에 실패했습니다.`;
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
