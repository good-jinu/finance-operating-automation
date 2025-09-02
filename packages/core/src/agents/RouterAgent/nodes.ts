import { Command } from "@langchain/langgraph";
import { createChatModel } from "../../llm";
import { createRouterPrompt } from "./prompts";
import {
	RouteDecisionSchema,
	type RouterState,
	type SubAgentConfig,
} from "./schemas";

const model = createChatModel();

export const createRouteNode = (subAgents: SubAgentConfig[]) => {
	return async (state: RouterState) => {
		const routerModel = model.withStructuredOutput(RouteDecisionSchema, {
			name: "route_decision",
		});

		const message =
			state.messages[state.messages.length - 1].content.toString();
		const routerPrompt = createRouterPrompt(subAgents);

		const result = await routerModel.invoke(
			await routerPrompt.invoke({ message: message }),
		);

		// 라우터의 결정을 상태에 병합하기 위해 반환합니다.
		return new Command({
			goto: result.route,
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
					input_filepath: state.input_filepath,
				};

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
