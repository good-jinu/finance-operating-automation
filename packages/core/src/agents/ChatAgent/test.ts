#!/usr/bin/env tsx

/**
 * ChatAgent 통합 테스트
 *
 * 실행 방법:
 * npx tsx packages/core/src/agents/ChatAgent/test.ts
 */

import { continueChatAgent, invokeChatAgent } from "./ChatAgent";

async function testChatAgent() {
	console.log("🚀 ChatAgent 테스트 시작...\n");

	try {
		// 테스트 1: 회사 목록 조회
		console.log("📊 테스트 1: 회사 목록 조회");
		const response1 = await invokeChatAgent(
			"등록된 모든 회사 목록을 보여주세요.",
			{ thread_id: "test-session-1" },
		);

		if (response1.success) {
			console.log("✅ 성공:", response1.content);
		} else {
			console.log("❌ 실패:", response1.error);
		}
		console.log(`\n${"=".repeat(50)}\n`);

		// 테스트 2: Gmail 메일 목록 조회
		console.log("📧 테스트 2: Gmail 메일 목록 조회");
		const response2 = await invokeChatAgent(
			"최근 Gmail 메일 목록 10개를 보여주세요. 읽지 않은 메일만 보고 싶습니다.",
			{ thread_id: "test-session-2" },
		);

		if (response2.success) {
			console.log("✅ 성공:", response2.content);
		} else {
			console.log("❌ 실패:", response2.error);
		}
		console.log(`\n${"=".repeat(50)}\n`);

		// 테스트 3: 답장 메일 목록 조회
		console.log("💬 테스트 3: 답장 메일 목록 조회");
		const response3 = await invokeChatAgent(
			"아직 발송되지 않은 답장 메일들을 확인해주세요.",
			{ thread_id: "test-session-3" },
		);

		if (response3.success) {
			console.log("✅ 성공:", response3.content);
		} else {
			console.log("❌ 실패:", response3.error);
		}
		console.log(`\n${"=".repeat(50)}\n`);

		// 테스트 4: 연속 대화 (동일 thread_id)
		console.log("🔄 테스트 4: 연속 대화");
		const response4a = await invokeChatAgent("ABC회사 정보를 찾아주세요.", {
			thread_id: "test-conversation",
		});

		console.log("첫 번째 요청:", response4a.success ? "성공" : "실패");
		if (response4a.success) {
			console.log(
				"응답:",
				`${response4a.content?.toString().substring(0, 100)}...`,
			);
		}

		const response4b = await continueChatAgent(
			"이 회사의 수권자 목록도 보여주세요.",
			"test-conversation",
		);

		console.log("두 번째 요청:", response4b.success ? "성공" : "실패");
		if (response4b.success) {
			console.log(
				"응답:",
				`${response4b.content?.toString().substring(0, 100)}...`,
			);
		}
		console.log(`\n${"=".repeat(50)}\n`);

		// 테스트 5: 잘못된 요청 처리
		console.log("⚠️  테스트 5: 잘못된 요청 처리");
		const response5 = await invokeChatAgent(
			"존재하지않는회사12345의 정보를 찾아주세요.",
			{ thread_id: "test-error" },
		);

		if (response5.success) {
			console.log("✅ 오류 처리 성공:", response5.content);
		} else {
			console.log("❌ 실패:", response5.error);
		}

		console.log("\n🎉 모든 테스트 완료!");
	} catch (error) {
		console.error("❌ 테스트 중 오류 발생:", error);
	}
}

// 스크립트가 직접 실행될 때만 테스트 실행
if (require.main === module) {
	testChatAgent();
}

export { testChatAgent };
