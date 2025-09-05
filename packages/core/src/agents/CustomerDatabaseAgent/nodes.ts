import { AIMessage, HumanMessage } from "@langchain/core/messages";
import { createChatModel } from "../../llm";
import {
	findAuthorizedPersonByName,
	updateAuthorizedPerson,
} from "../../models/AuthorizedPerson";
import { findCustomerCompanyByName } from "../../models/CustomerCompany";
import {
	findLatestOfficialSealByCompanyId,
	updateOfficialSeal,
} from "../../models/OfficialSeal";
import {
	findPaymentAccountByAccountHolder,
	findPaymentAccountByAccountNumber,
	searchPaymentAccountsByBankName,
	updatePaymentAccount,
} from "../../models/PaymentAccount";
import type { CustomerDatabaseState } from "./schemas";
import {
	AuthorizedPersonAnalysisSchema,
	OfficialSealAnalysisSchema,
	PaymentAccountAnalysisSchema,
	RouteDecisionSchema,
} from "./schemas";

const model = createChatModel();

// 라우팅 노드 - 어떤 업데이트 타입인지만 결정
export const routeRequest = async (
	state: CustomerDatabaseState,
): Promise<Partial<CustomerDatabaseState>> => {
	console.log("🔄 [routeRequest] 라우팅 노드 시작");
	console.log("📝 [routeRequest] 입력 상태:", {
		contentLength: state.content?.length || 0,
		messagesCount: state.messages.length,
	});

	const contentToAnalyze =
		state.content ||
		state.messages[state.messages.length - 1]?.content?.toString() ||
		"";

	console.log(
		"📄 [routeRequest] 분석할 내용:",
		`${contentToAnalyze.substring(0, 200)}...`,
	);

	const routePrompt = `
사용자 요청을 분석하여 업데이트 유형과 회사명을 결정하여 예시처럼 JSON으로 반영하세요.

분석할 내용: ${contentToAnalyze}

업데이트 유형:
- authorized_person: 수권자 정보 변경 (이름, 이메일, 전화번호 등)
- payment_account: 결제계좌 정보 변경 (은행, 계좌번호, 예금주 등)
- official_seal: 인감/서명 정보 변경 (파일 경로 등)

예시) {{ "update_type": "authorized_person", "company_name": "Example Corp" }}

반드시 예시의 형식을 지키십시오.
`;

	const routeModel = model.withStructuredOutput(RouteDecisionSchema);

	try {
		console.log("🤖 [routeRequest] LLM 호출 시작");
		const result = await routeModel.invoke([new HumanMessage(routePrompt)]);
		console.log("✅ [routeRequest] LLM 응답:", result);

		const returnState = {
			update_type: result.update_type,
			search_criteria: { company_name: result.company_name },
		};

		console.log("📤 [routeRequest] 반환 상태:", returnState);
		console.log(
			"🏁 [routeRequest] 라우팅 노드 완료 - 다음 노드:",
			result.update_type,
		);

		return returnState;
	} catch (error) {
		console.error("❌ [routeRequest] 에러 발생:", error);
		return {
			messages: [new AIMessage("요청을 라우팅하는 중 오류가 발생했습니다.")],
		};
	}
};

// 수권자 정보 분석 노드
export const analyzeAuthorizedPersonRequest = async (
	state: CustomerDatabaseState,
): Promise<Partial<CustomerDatabaseState>> => {
	console.log("👤 [analyzeAuthorizedPerson] 수권자 분석 노드 시작");
	console.log("📝 [analyzeAuthorizedPerson] 현재 상태:", {
		update_type: state.update_type,
		company_name: state.search_criteria?.company_name,
	});

	const contentToAnalyze =
		state.content || state.messages[state.messages.length - 1]?.content || "";

	const analysisPrompt = `
수권자 정보 변경 요청을 분석하여 수권자명과 변경할 데이터를 JSON으로 작성해주세요.

분석할 내용: ${contentToAnalyze}

변경 가능한 필드:
- name: 수권자 이름 (새로운 이름으로 변경하는 경우)
- email: 이메일 주소 (유효한 이메일 형식)
- phone_number: 전화번호 (하이픈 포함 가능)

예시) {{ "name": "이전 인물 이름", "update_data": { "name": "새로운 이름", "email": "some@gmail.com", "phone_number": "123-456-7890" } }}

반드시 예시의 형식을 지키십시오.
`;

	const analysisModel = model.withStructuredOutput(
		AuthorizedPersonAnalysisSchema,
	);

	try {
		console.log("🤖 [analyzeAuthorizedPerson] LLM 호출 시작");
		const result = await analysisModel.invoke([
			new HumanMessage(analysisPrompt),
		]);
		console.log("✅ [analyzeAuthorizedPerson] LLM 응답:", result);

		const returnState = {
			search_criteria: {
				name: result.name,
			},
			update_data: result.update_data,
		};

		console.log("📤 [analyzeAuthorizedPerson] 반환 상태:", returnState);
		console.log("🏁 [analyzeAuthorizedPerson] 수권자 분석 완료");

		return returnState;
	} catch (error) {
		console.error("❌ [analyzeAuthorizedPerson] 에러 발생:", error);
		return {
			messages: [new AIMessage("수권자 정보 분석 중 오류가 발생했습니다.")],
		};
	}
};

// 결제계좌 정보 분석 노드
export const analyzePaymentAccountRequest = async (
	state: CustomerDatabaseState,
): Promise<Partial<CustomerDatabaseState>> => {
	console.log("💳 [analyzePaymentAccount] 결제계좌 분석 노드 시작");
	console.log("📝 [analyzePaymentAccount] 현재 상태:", {
		update_type: state.update_type,
		company_name: state.search_criteria?.company_name,
	});

	const contentToAnalyze =
		state.content || state.messages[state.messages.length - 1]?.content || "";

	const analysisPrompt = `
결제계좌 정보 변경 요청을 분석하여 검색 조건과 변경할 데이터를 JSON으로 작성해주세요.

분석할 내용: ${contentToAnalyze}

검색 조건 (기존 계좌를 찾기 위해 하나 이상 필요):
- account_number: 기존 계좌번호
- account_holder: 기존 예금주명
- bank_name: 기존 은행명

변경할 수 있는 필드:
- bank_name: 새로운 은행명
- account_number: 새로운 계좌번호
- account_holder: 새로운 예금주명

예시) { "search_criteria": { "account_number": "123-456-7890" }, "update_data": { "bank_name": "새로운은행", "account_holder": "김철수" } }
`;

	const analysisModel = model.withStructuredOutput(
		PaymentAccountAnalysisSchema,
	);

	try {
		console.log("🤖 [analyzePaymentAccount] LLM 호출 시작");
		const result = await analysisModel.invoke([
			new HumanMessage(analysisPrompt),
		]);
		console.log("✅ [analyzePaymentAccount] LLM 응답:", result);

		const returnState = {
			search_criteria: {
				...state.search_criteria,
				...result.search_criteria,
			},
			update_data: result.update_data,
		};

		console.log("📤 [analyzePaymentAccount] 반환 상태:", returnState);
		console.log("🏁 [analyzePaymentAccount] 결제계좌 분석 완료");

		return returnState;
	} catch (error) {
		console.error("❌ [analyzePaymentAccount] 에러 발생:", error);
		return {
			messages: [new AIMessage("결제계좌 정보 분석 중 오류가 발생했습니다.")],
		};
	}
};

// 인감/서명 정보 분석 노드
export const analyzeOfficialSealRequest = async (
	state: CustomerDatabaseState,
): Promise<Partial<CustomerDatabaseState>> => {
	console.log("🔏 [analyzeOfficialSeal] 인감/서명 분석 노드 시작");
	console.log("📝 [analyzeOfficialSeal] 현재 상태:", {
		update_type: state.update_type,
		company_name: state.search_criteria?.company_name,
	});

	const contentToAnalyze =
		state.content || state.messages[state.messages.length - 1]?.content || "";

	const analysisPrompt = `
인감/서명 정보 변경 요청을 분석하여 변경할 데이터를 JSON으로 작성해주세요.

분석할 내용: ${contentToAnalyze}

변경할 수 있는 필드:
- file_path: 새로운 인감/서명 파일의 경로

예시) { "update_data": { "file_path": "/uploads/seals/new_company_seal.png" } }
`;

	const analysisModel = model.withStructuredOutput(OfficialSealAnalysisSchema);

	try {
		console.log("🤖 [analyzeOfficialSeal] LLM 호출 시작");
		const result = await analysisModel.invoke([
			new HumanMessage(analysisPrompt),
		]);
		console.log("✅ [analyzeOfficialSeal] LLM 응답:", result);

		const returnState = {
			update_data: result.update_data,
		};

		console.log("📤 [analyzeOfficialSeal] 반환 상태:", returnState);
		console.log("🏁 [analyzeOfficialSeal] 인감/서명 분석 완료");

		return returnState;
	} catch (error) {
		console.error("❌ [analyzeOfficialSeal] 에러 발생:", error);
		return {
			messages: [new AIMessage("인감/서명 정보 분석 중 오류가 발생했습니다.")],
		};
	}
};

export const executeUpdate = async (
	state: CustomerDatabaseState,
): Promise<Partial<CustomerDatabaseState>> => {
	console.log("⚡ [executeUpdate] 업데이트 실행 노드 시작");
	console.log("📝 [executeUpdate] 현재 상태:", {
		update_type: state.update_type,
		search_criteria: state.search_criteria,
		update_data: state.update_data,
	});

	if (!state.update_type || !state.search_criteria || !state.update_data) {
		console.warn("⚠️ [executeUpdate] 필수 정보 부족");
		return {
			messages: [new AIMessage("업데이트에 필요한 정보가 부족합니다.")],
		};
	}

	try {
		let success = false;
		let resultMessage = "";
		const { company_name } = state.search_criteria;

		console.log("🔍 [executeUpdate] 회사 검색:", company_name);

		// 1. 먼저 회사를 찾습니다
		const company = findCustomerCompanyByName(company_name);
		if (!company) {
			console.error("❌ [executeUpdate] 회사를 찾을 수 없음:", company_name);
			return {
				...state,
				messages: [
					new AIMessage(`회사 '${company_name}'을(를) 찾을 수 없습니다.`),
				],
			};
		}

		console.log("✅ [executeUpdate] 회사 발견:", {
			id: company.id,
			name: company.name,
		});

		console.log(
			"🔄 [executeUpdate] 업데이트 타입별 처리 시작:",
			state.update_type,
		);

		switch (state.update_type) {
			case "authorized_person": {
				console.log("👤 [executeUpdate] 수권자 업데이트 처리");
				const { name } = state.search_criteria;
				if (!name) {
					console.warn("⚠️ [executeUpdate] 수권자명 누락");
					resultMessage = "수권자명이 제공되지 않았습니다.";
					break;
				}

				console.log("🔍 [executeUpdate] 수권자 검색:", name);
				const existingPerson = findAuthorizedPersonByName(name, company.id);
				if (!existingPerson) {
					console.error("❌ [executeUpdate] 수권자를 찾을 수 없음:", name);
					resultMessage = `회사 '${company_name}'에서 수권자 '${name}'을(를) 찾을 수 없습니다.`;
					break;
				}

				console.log("✅ [executeUpdate] 수권자 발견:", {
					id: existingPerson.id,
					name: existingPerson.name,
				});
				console.log("🔄 [executeUpdate] 수권자 정보 업데이트 시도");
				success = updateAuthorizedPerson(existingPerson.id!, state.update_data);
				resultMessage = success
					? `수권자 '${name}'의 정보가 성공적으로 업데이트되었습니다.`
					: `수권자 '${name}'의 정보 업데이트에 실패했습니다.`;
				console.log(
					success ? "✅" : "❌",
					"[executeUpdate] 수권자 업데이트 결과:",
					success,
				);
				break;
			}

			case "payment_account": {
				console.log("💳 [executeUpdate] 결제계좌 업데이트 처리");
				const { account_number, account_holder, bank_name } =
					state.search_criteria;
				let existingAccount = null;

				console.log("🔍 [executeUpdate] 결제계좌 검색 조건:", {
					account_number,
					account_holder,
					bank_name,
				});

				// 계좌번호로 찾기
				if (account_number) {
					console.log("🔍 [executeUpdate] 계좌번호로 검색:", account_number);
					existingAccount = findPaymentAccountByAccountNumber(
						account_number,
						company.id,
					);
				}
				// 예금주명으로 찾기
				else if (account_holder) {
					console.log("🔍 [executeUpdate] 예금주명으로 검색:", account_holder);
					existingAccount = findPaymentAccountByAccountHolder(
						account_holder,
						company.id,
					);
				}
				// 은행명으로 검색
				else if (bank_name) {
					console.log("🔍 [executeUpdate] 은행명으로 검색:", bank_name);
					const accounts = searchPaymentAccountsByBankName(
						bank_name,
						company.id,
					);
					if (accounts.length > 0) {
						existingAccount = accounts[0]; // 가장 최근 등록된 계좌 사용
						console.log(
							"✅ [executeUpdate] 은행명 검색 결과:",
							`${accounts.length}개 발견`,
						);
					}
				}

				if (!existingAccount) {
					const searchInfo = account_number
						? `계좌번호 '${account_number}'`
						: account_holder
							? `예금주 '${account_holder}'`
							: bank_name
								? `은행 '${bank_name}'`
								: "지정된 조건";
					console.error(
						"❌ [executeUpdate] 결제계좌를 찾을 수 없음:",
						searchInfo,
					);
					resultMessage = `회사 '${company_name}'에서 ${searchInfo}에 해당하는 결제계좌를 찾을 수 없습니다.`;
					break;
				}

				console.log("✅ [executeUpdate] 결제계좌 발견:", {
					id: existingAccount.id,
					account_number: existingAccount.account_number,
				});
				console.log("🔄 [executeUpdate] 결제계좌 정보 업데이트 시도");
				success = updatePaymentAccount(existingAccount.id!, state.update_data);
				const accountInfo = account_number
					? `계좌번호 '${account_number}'`
					: account_holder
						? `예금주 '${account_holder}'`
						: `ID ${existingAccount.id}`;
				resultMessage = success
					? `결제계좌 (${accountInfo})의 정보가 성공적으로 업데이트되었습니다.`
					: `결제계좌 (${accountInfo})의 정보 업데이트에 실패했습니다.`;
				console.log(
					success ? "✅" : "❌",
					"[executeUpdate] 결제계좌 업데이트 결과:",
					success,
				);
				break;
			}

			case "official_seal": {
				console.log("🔏 [executeUpdate] 인감/서명 업데이트 처리");
				console.log(
					"🔍 [executeUpdate] 인감/서명 검색 for company_id:",
					company.id,
				);
				const existingSeal = findLatestOfficialSealByCompanyId(company.id!);
				if (!existingSeal) {
					console.error("❌ [executeUpdate] 인감/서명을 찾을 수 없음");
					resultMessage = `회사 '${company_name}'에 등록된 인감을 찾을 수 없습니다.`;
					break;
				}

				console.log("✅ [executeUpdate] 인감/서명 발견:", {
					id: existingSeal.id,
				});
				console.log("🔄 [executeUpdate] 인감/서명 정보 업데이트 시도");
				success = updateOfficialSeal(existingSeal.id!, state.update_data);
				resultMessage = success
					? `회사 '${company_name}'의 인감/서명 정보가 성공적으로 업데이트되었습니다.`
					: `회사 '${company_name}'의 인감/서명 정보 업데이트에 실패했습니다.`;
				console.log(
					success ? "✅" : "❌",
					"[executeUpdate] 인감/서명 업데이트 결과:",
					success,
				);
				break;
			}

			default:
				console.error(
					"❌ [executeUpdate] 지원하지 않는 업데이트 유형:",
					state.update_type,
				);
				resultMessage = "지원하지 않는 업데이트 유형입니다.";
		}

		const finalResult = {
			messages: [new AIMessage(resultMessage)],
		};

		console.log("📤 [executeUpdate] 최종 결과:", resultMessage);
		console.log("🏁 [executeUpdate] 업데이트 실행 완료");

		return finalResult;
	} catch (error) {
		console.error("❌ [executeUpdate] 예외 발생:", error);
		const errorMessage = `데이터베이스 업데이트 중 오류가 발생했습니다: ${error}`;
		return {
			messages: [new AIMessage(errorMessage)],
		};
	}
};
