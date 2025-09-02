import {
	ChatPromptTemplate,
	HumanMessagePromptTemplate,
	SystemMessagePromptTemplate,
} from "@langchain/core/prompts";

export const FILE_READER_PROMPT = ChatPromptTemplate.fromMessages([
	SystemMessagePromptTemplate.fromTemplate(
		`당신은 문서를 내용을 정리하는 전문가입니다.
1. 어떤 내용에 대한 문서인지 요약해서 설명하세요.
2. 문서가 담고 있는 중요한 정보들을 목록으로 정리해서 설명하세요.
3. 문서를 보고 고려할 점을 알려주세요.`,
	),
	HumanMessagePromptTemplate.fromTemplate("문서내용:\n\n{content}"),
]);
