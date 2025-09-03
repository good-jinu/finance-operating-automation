import { END, START, StateGraph } from "@langchain/langgraph";
import { createFileReaderAgent } from "../FileReaderAgent/workflow";
import { createGuideProviderAgent } from "../GuideProviderAgent/workflow";
import { createMailNode, createRouteNode, createSubAgentNode } from "./nodes";
import { RouterStateAnnotation, type SubAgentConfig } from "./schemas";

// 하위 에이전트 설정 - 여기서만 관리하면 됨
const SUB_AGENTS: SubAgentConfig[] = [
	{
		name: "GuideProvider",
		description: `사용자가 특정 작업을 수행하는 방법에 대한 가이드 또는 문서를 요청할 때 사용되는 워크플로입니다. 사용 가능한 주제는 "authority_change", "payment_account_change", "seal_sign_change"입니다.
예시:
- 사용자 메시지: "결제 계좌를 어떻게 바꾸나요?"
- 응답: {{"route": "GuideProvider"}}`,
		workflow: createGuideProviderAgent(),
		stateMapper: (state) => ({
			messages: state.messages,
		}),
		outputMapper: (state) => ({
			description: state.description,
			attachments: [state.attachment],
		}),
	},
	{
		name: "FileReader",
		description: `사용자가 파일 경로를 제공하고 해당 파일의 내용을 읽거나, 요약하거나, 처리해 달라고 요청할 때 사용되는 워크플로입니다.
예시:
- 사용자 메시지: "/path/to/file.txt 파일을 읽어주세요"
- 응답: {{"route": "FileReader"}}`,
		workflow: createFileReaderAgent(),
		stateMapper: (state) => ({
			messages: state.messages,
			filepaths: state.input_filepaths,
		}),
		outputMapper: (state) => ({
			description: state.description,
			attachments: [],
		}),
	},
];

// RouterAgent 생성 함수 - 하위 워크플로들을 주입받음
export const createRouterAgent = (subAgents: SubAgentConfig[] = SUB_AGENTS) => {
	const routeNode = createRouteNode(subAgents);

	// 초기 StateGraph 생성 및 'route_node' 추가
	const workflow = new StateGraph(RouterStateAnnotation)
		.addNode("route_node", routeNode, {
			// 'route_node'가 끝날 수 있는 모든 하위 에이전트 이름을 동적으로 지정
			ends: subAgents.map((agent) => agent.name),
		})
		.addEdge(START, "route_node")
		// 메일 작성 노드 추가
		.addNode("create_mail", createMailNode)
		.addEdge("create_mail", END);

	// subAgents 배열을 순회하며 각 에이전트에 대한 노드와 엣지를 동적으로 추가
	subAgents.reduce(
		(graph, agent) =>
			graph
				// biome-ignore lint:suspicious/noExplicitAny
				.addNode(agent.name as any, createSubAgentNode(agent))
				// 각 서브 에이전트가 완료되면 메일 작성 노드로 이동
				.addEdge(agent.name, "create_mail"),
		workflow,
	);

	return workflow.compile();
};
