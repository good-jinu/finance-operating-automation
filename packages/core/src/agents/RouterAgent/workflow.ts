import { END, START, StateGraph } from "@langchain/langgraph";
import { createCustomerDatabaseAgent } from "../CustomerDatabaseAgent/workflow";
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
			messages: state.messages,
			attachments: [state.attachment],
		}),
	},
	{
		name: "FileReaderToDatabase",
		description: `사용자가 파일 경로를 제공하고 해당 파일의 내용을 읽어서 고객 데이터베이스를 업데이트해야 할 때 사용되는 워크플로입니다. 파일을 읽은 후 자동으로 데이터베이스 처리를 진행합니다.
예시:
- 사용자 메시지: "수권자 변경 서류 전달드립니다"
- 응답: {{"route": "FileReaderToDatabase"}}`,
		workflow: createFileReaderAgent(),
		stateMapper: (state) => ({
			messages: state.messages,
			filepaths: state.input_filepaths,
		}),
		outputMapper: (state) => ({
			messages: state.messages,
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
				.addNode(agent.name as any, createSubAgentNode(agent)),
		workflow,
	);

	// CustomerDatabaseAgent 노드 추가
	workflow.addNode(
		"CustomerDatabase",
		createSubAgentNode({
			name: "CustomerDatabase",
			description: "고객 데이터베이스 업데이트 처리",
			workflow: createCustomerDatabaseAgent(),
			stateMapper: (state) => ({
				messages: state.messages,
				content: state.description, // FileReader의 결과를 content로 전달
			}),
			outputMapper: (state) => ({
				messages: state.messages,
				attachments: [],
			}),
		}),
	);

	// 에지 연결: GuideProvider는 바로 create_mail로, FileReaderToDatabase는 CustomerDatabase를 거쳐 create_mail로
	workflow.addEdge("GuideProvider" as any, "create_mail");
	workflow.addEdge("FileReaderToDatabase" as any, "CustomerDatabase" as any);
	workflow.addEdge("CustomerDatabase" as any, "create_mail");

	return workflow.compile();
};
