import {
	ChatPromptTemplate,
	HumanMessagePromptTemplate,
	SystemMessagePromptTemplate,
} from "@langchain/core/prompts";

export const GUIDE_PROVIDER_PROMPT = ChatPromptTemplate.fromMessages([
	SystemMessagePromptTemplate.fromTemplate(
		`당신은 사용자 요청의 주제를 식별하는 전문가입니다.
사용자 메시지를 기반으로, 요청하는 가이드의 주제를 식별해야 합니다.

사용 가능한 주제는 다음과 같습니다:
- "authority_change" (권한 변경)
- "payment_account_change" (결제 계좌 변경)
- "seal_sign_change" (인감/서명 변경)

사용자의 요청과 가장 일치하는 단일 주제로 응답하세요.
예를들어, 
{{ "topic": "authority_change" }}
{{ "topic": "payment_account_change" }}
{{ "topic": "seal_sign_change" }}`,
	),
	HumanMessagePromptTemplate.fromTemplate("{message}"),
]);
