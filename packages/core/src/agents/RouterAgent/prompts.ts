import {
	ChatPromptTemplate,
	HumanMessagePromptTemplate,
	SystemMessagePromptTemplate,
} from "@langchain/core/prompts";
import type { SubAgentConfig } from "./schemas";

export const createRouterPrompt = (subAgents: SubAgentConfig[], filepath?: string) => {
	const agentDescriptions = subAgents
		.map((agent, index) => {
			return `${index + 1}. **${agent.name}**: ${agent.description}`;
		})
		.join("\n\n");

	const availableRoutes = subAgents
		.map((agent) => agent.name)
		.concat(["__end__"]);

	const additionalPrompt = filepath ? `파일을 읽어야 합니다.` : "";

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
