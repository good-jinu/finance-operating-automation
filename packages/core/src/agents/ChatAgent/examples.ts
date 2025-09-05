#!/usr/bin/env tsx

/**
 * ChatAgent 사용 예시
 *
 * 이 파일은 ChatAgent의 다양한 사용 방법을 보여줍니다.
 */

import {
	continueChatAgent,
	invokeChatAgent,
	resetChatAgent,
} from "./ChatAgent";

// 기본 사용법 예시
async function basicExample() {
	console.log("=== 기본 사용법 ===");

	const response = await invokeChatAgent(
		"안녕하세요! 현재 시스템에서 어떤 도움을 받을 수 있는지 알려주세요.",
	);

	if (response.success) {
		console.log("AI 응답:", response.content);
	} else {
		console.log("오류:", response.error);
	}
}

// Gmail 메일 관리 예시
async function gmailExample() {
	console.log("=== Gmail 메일 관리 ===");

	// 읽지 않은 메일 조회
	await invokeChatAgent("읽지 않은 메일 목록을 보여주세요.", {
		thread_id: "gmail-session",
	});

	// 답장 메일 상태 확인
	await continueChatAgent(
		"아직 발송되지 않은 답장 메일들도 확인해주세요.",
		"gmail-session",
	);
}

// 회사 및 수권자 관리 예시
async function companyManagementExample() {
	console.log("=== 회사 및 수권자 관리 ===");

	const sessionId = "company-management";

	// 회사 검색
	await invokeChatAgent("ABC회사의 정보를 찾아주세요.", {
		thread_id: sessionId,
	});

	// 수권자 목록 조회
	await continueChatAgent("이 회사의 등록된 수권자들을 보여주세요.", sessionId);

	// 수권자 정보 변경
	await continueChatAgent(
		"김수권 수권자의 전화번호를 010-1234-5678로 변경해주세요.",
		sessionId,
	);
}

// 결제계좌 관리 예시
async function accountManagementExample() {
	console.log("=== 결제계좌 관리 ===");

	const sessionId = "account-management";

	// 계좌 검색
	await invokeChatAgent("XYZ회사의 국민은행 계좌 정보를 찾아주세요.", {
		thread_id: sessionId,
	});

	// 계좌 정보 변경
	await continueChatAgent(
		"이 계좌의 예금주명을 '새로운예금주'로 변경해주세요.",
		sessionId,
	);
}

// 인감/서명 관리 예시
async function sealManagementExample() {
	console.log("=== 인감/서명 관리 ===");

	// 인감 정보 조회 및 변경
	await invokeChatAgent(
		"DEF회사의 인감 정보를 확인하고, 새로운 파일 경로 '/path/to/new/seal.png'로 업데이트해주세요.",
	);
}

// 대화 히스토리 관리 예시
async function conversationManagementExample() {
	console.log("=== 대화 히스토리 관리 ===");

	const sessionId = "conversation-test";

	// 첫 번째 대화
	await invokeChatAgent("내 이름은 홍길동입니다.", { thread_id: sessionId });

	// 연속 대화 (이전 컨텍스트 기억)
	await continueChatAgent("내 이름이 뭔지 기억하시나요?", sessionId);

	// 대화 초기화
	await resetChatAgent(sessionId);

	// 초기화 후 대화 (이전 컨텍스트 망각)
	await continueChatAgent("내 이름이 뭔지 기억하시나요?", sessionId);
}

// 복합 작업 예시
async function complexWorkflowExample() {
	console.log("=== 복합 작업 워크플로우 ===");

	const sessionId = "complex-workflow";

	await invokeChatAgent(
		`
		다음 작업들을 순서대로 수행해주세요:
		1. 읽지 않은 Gmail 메일이 있는지 확인
		2. ABC회사가 등록되어 있는지 검색
		3. 해당 회사의 수권자 목록 조회
		4. 해당 회사의 결제계좌 목록 조회
		
		각 단계별로 결과를 정리해서 보고해주세요.
	`,
		{ thread_id: sessionId },
	);
}

// 오류 처리 예시
async function errorHandlingExample() {
	console.log("=== 오류 처리 ===");

	// 존재하지 않는 회사 검색
	await invokeChatAgent("존재하지않는회사12345의 정보를 찾아주세요.");

	// 잘못된 파라미터로 계좌 업데이트 시도
	await invokeChatAgent(
		"ABC회사의 존재하지않는계좌번호123의 정보를 변경해주세요.",
	);
}

// 모든 예시 실행
async function runAllExamples() {
	console.log("🚀 ChatAgent 사용 예시 시작...\n");

	try {
		await basicExample();
		await gmailExample();
		await companyManagementExample();
		await accountManagementExample();
		await sealManagementExample();
		await conversationManagementExample();
		await complexWorkflowExample();
		await errorHandlingExample();

		console.log("\n🎉 모든 예시 완료!");
	} catch (error) {
		console.error("❌ 예시 실행 중 오류:", error);
	}
}

// CLI 사용을 위한 간단한 인터랙티브 모드
async function interactiveMode() {
	const readline = require("node:readline");

	const rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout,
	});

	console.log("🤖 ChatAgent 인터랙티브 모드");
	console.log("종료하려면 'exit' 또는 'quit'을 입력하세요.\n");

	const sessionId = `interactive-${Date.now()}`;

	const askQuestion = () => {
		rl.question("👤 You: ", async (input) => {
			if (input.toLowerCase() === "exit" || input.toLowerCase() === "quit") {
				rl.close();
				return;
			}

			try {
				const response = await continueChatAgent(input, sessionId);
				if (response.success) {
					console.log("🤖 AI:", response.content);
				} else {
					console.log("❌ Error:", response.error);
				}
			} catch (error) {
				console.log("❌ Error:", error);
			}

			console.log(); // 빈 줄
			askQuestion();
		});
	};

	askQuestion();
}

// 스크립트가 직접 실행될 때의 동작
if (require.main === module) {
	const args = process.argv.slice(2);

	if (args.includes("--interactive") || args.includes("-i")) {
		interactiveMode();
	} else {
		runAllExamples();
	}
}

export {
	basicExample,
	gmailExample,
	companyManagementExample,
	accountManagementExample,
	sealManagementExample,
	conversationManagementExample,
	complexWorkflowExample,
	errorHandlingExample,
	interactiveMode,
};
