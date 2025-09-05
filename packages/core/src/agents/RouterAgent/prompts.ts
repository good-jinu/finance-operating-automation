import {
	ChatPromptTemplate,
	HumanMessagePromptTemplate,
	SystemMessagePromptTemplate,
} from "@langchain/core/prompts";
import type { SubAgentConfig } from "./schemas";

export const createRouterPrompt = (
	subAgents: SubAgentConfig[],
	filepath?: string,
) => {
	const agentDescriptions = subAgents
		.map((agent, index) => {
			return `${index + 1}. **${agent.name}**: ${agent.description}`;
		})
		.join("\n\n");

	const availableRoutes = subAgents
		.map((agent) => agent.name)
		.concat(["__end__"]);

	const additionalPrompt = filepath ? `첨부된 파일을 먼저 읽어주세요.` : "";

	return ChatPromptTemplate.fromMessages([
		SystemMessagePromptTemplate.fromTemplate(
			`사용자의 요청을 올바른 워크플로로 라우팅하는 전문가입니다.
사용자의 메시지를 기반으로, 다음 워크플로 중 어느 것을 호출할지 결정해야 합니다:

${agentDescriptions}

응답 형식:
- route: 선택한 워크플로 이름 (${availableRoutes.join(", ")})

사용자의 메시지가 위의 어떤 카테고리에도 해당되지 않는 경우, {{"route": "__end__"}}로 응답해야 합니다.
${additionalPrompt}`,
		),
		HumanMessagePromptTemplate.fromTemplate("{message}"),
	]);
};

export const MAIL_CREATION_PROMPT = ChatPromptTemplate.fromMessages([
	SystemMessagePromptTemplate.fromTemplate(
		`당신은 사용자의 요청과 에이전트 처리 결과를 바탕으로 이메일을 작성하는 전문가입니다.

사용자의 원래 메시지와 에이전트가 처리한 결과를 참고하여 적절한 이메일 제목과 본문을 작성해주세요.

요구사항:
- 이메일 제목은 간결하고 명확하게 작성
- 이메일 본문은 정중하고 전문적인 톤으로 작성
- 첨부파일이 있는 경우 본문에서 언급
- 한국어로 작성

당신은 KT은행 소속 결제팀 소속 이믿음 대리입니다.
따라서 메일을 작성할 때에는 다음의 형식을 따라 주세요.

---

안녕하세요. KT은행 결제팀 이믿음 대리입니다.

{{ mail_body }}

감사합니다.
KT은행 결제팀 이믿음 대리 드림`,
	),
	HumanMessagePromptTemplate.fromTemplate(
		`사용자 메시지: {user_message}

에이전트 처리 결과:
- 본문 내용: {agent_result}
- 첨부파일: {attachments}

위 정보를 바탕으로 적절한 이메일 제목과 본문을 작성해주세요.

예시:
{{ "title": "메일 제목", "body": "본문 내용을 작성해주세요." }}`,
	),
]);
