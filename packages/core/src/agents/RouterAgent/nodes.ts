import { Command } from "@langchain/langgraph";
import { createChatModel } from "../../llm";
import { createRouterPrompt, MAIL_CREATION_PROMPT } from "./prompts";
import {
	MailWriterSchema,
	RouteDecisionSchema,
	type RouterState,
	type SubAgentConfig,
} from "./schemas";

const model = createChatModel();

export const createRouteNode = (subAgents: SubAgentConfig[]) => {
	return async (state: RouterState) => {
		if (state.input_filepaths && state.input_filepaths.length > 0) {
			return new Command({
				goto: "FileReaderToDatabase",
			});
		}

		const routerModel = model.withStructuredOutput(RouteDecisionSchema, {
			name: "route_decision",
		});

		const message =
			state.messages[state.messages.length - 1].content.toString();
		const routerPrompt = createRouterPrompt(
			subAgents,
			state.input_filepaths[0],
		);

		const result = await routerModel.invoke(
			await routerPrompt.invoke({ message: message }),
		);

		const goto =
			subAgents.find((agent) => agent.name === result.route)?.name ??
			"create_mail";

		// 라우터의 결정을 상태에 병합하기 위해 반환합니다.
		return new Command({
			goto,
		});
	};
};

// 하위 에이전트 워크플로를 실행하는 범용 노드 생성기
export const createSubAgentNode = (agentConfig: SubAgentConfig) => {
	return async (state: RouterState) => {
		// 상태 변환이 정의된 경우 사용, 아니면 기본값 사용
		const mappedState = agentConfig.stateMapper
			? agentConfig.stateMapper(state)
			: {
					messages: state.messages,
					input_filepaths: state.input_filepaths,
				};
		console.log(`${agentConfig.name}: ${JSON.stringify(mappedState)}`);

		// 하위 워크플로 실행
		const result = await agentConfig.workflow.invoke(mappedState);

		// 결과를 RouterState 형식으로 변환
		return agentConfig.outputMapper
			? agentConfig.outputMapper(result)
			: {
					mail_title: "",
					mail_body: "",
					attachments: [],
				};
	};
};

// 메일 제목과 본문을 작성하는 노드
export const createMailNode = async (
	state: RouterState,
): Promise<Partial<RouterState>> => {
	const userMessage =
		state.messages[state.messages.length - 1].content.toString();
	const agentResult = state.mail_body || "처리 완료";
	const attachments =
		state.attachments.length > 0 ? state.attachments.join(", ") : "없음";
	const mailModel = model.withStructuredOutput(MailWriterSchema);

	const mailResponse = await mailModel.invoke(
		await MAIL_CREATION_PROMPT.invoke({
			user_message: userMessage,
			agent_result: agentResult,
			attachments: attachments,
		}),
	);

	return {
		mail_title: mailResponse.title,
		mail_body: mailResponse.body,
	};
};
