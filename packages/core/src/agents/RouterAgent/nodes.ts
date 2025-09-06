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
		console.log("🚦 [Router] 라우팅 노드 시작");

		if (state.input_filepaths && state.input_filepaths.length > 0) {
			console.log(
				`🚦 [Router] 파일 경로가 감지되어 'FileReaderToDatabase'로 라우팅합니다.`,
			);
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
			subAgents.filter((agent) => agent.name !== "FileReaderToDatabase"),
			state.input_filepaths[0],
		);

		console.log(`🤖 [Router] LLM 호출하여 라우팅 결정, 메시지: ${message}`);
		const result = await routerModel.invoke(
			await routerPrompt.invoke({ message: message }),
		);
		console.log("🤖 [Router] LLM 라우팅 결과:", result);

		const goto =
			subAgents.find((agent) => agent.name === result.route)?.name ??
			"create_mail";

		console.log(`✅ [Router] 라우팅 결정: ${goto}`);
		// 라우터의 결정을 상태에 병합하기 위해 반환합니다.
		return new Command({
			goto,
		});
	};
};

// 하위 에이전트 워크플로를 실행하는 범용 노드 생성기
export const createSubAgentNode = (agentConfig: SubAgentConfig) => {
	return async (state: RouterState) => {
		console.log(`🚀 [Router] 하위 에이전트 노드 시작: ${agentConfig.name}`);
		// 상태 변환이 정의된 경우 사용, 아니면 기본값 사용
		const mappedState = agentConfig.stateMapper
			? agentConfig.stateMapper(state)
			: {
					messages: state.messages,
					input_filepaths: state.input_filepaths,
			  };
		console.log(
			`➡️ [Router] 하위 에이전트 '${agentConfig.name}'에 전달할 상태: ${JSON.stringify(mappedState)}`,
		);

		// 하위 워크플로 실행
		const result = await agentConfig.workflow.invoke(mappedState);
		console.log(
			`⬅️ [Router] 하위 에이전트 '${agentConfig.name}'로부터 받은 결과: ${JSON.stringify(result)}`,
		);

		// 결과를 RouterState 형식으로 변환
		const output = agentConfig.outputMapper
			? agentConfig.outputMapper(result)
			: {
					mail_title: "",
					mail_body: "",
					attachments: [],
			  };

		console.log(`🏁 [Router] 하위 에이전트 노드 완료: ${agentConfig.name}`);
		return output;
	};
};

// 메일 제목과 본문을 작성하는 노드
export const createMailNode = async (
	state: RouterState,
): Promise<Partial<RouterState>> => {
	console.log("✉️ [Router] 메일 생성 노드 시작");
	const userMessage =
		state.messages[state.messages.length - 1].content.toString();
	const agentWorkHistory = state.messages
		.slice(1) // 첫 번째 사용자 메시지 제외
		.map((msg) => msg.content)
		.join("\n");
	const attachments =
		state.attachments.length > 0 ? state.attachments.join(", ") : "없음";
	const mailModel = model.withStructuredOutput(MailWriterSchema);

	console.log("🤖 [Router] LLM 호출하여 메일 내용 생성");
	const mailResponse = await mailModel.invoke(
		await MAIL_CREATION_PROMPT.invoke({
			user_message: userMessage,
			agent_result: agentWorkHistory,
			attachments: attachments,
		}),
	);

	console.log("✅ [Router] 메일 내용 생성 완료");
	return {
		mail_title: mailResponse.title,
		mail_body: mailResponse.body,
	};
};
