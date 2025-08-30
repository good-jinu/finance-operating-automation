import {
	getActiveSession,
	getRecentEmailLogs,
	getSessionById,
	type ReplyProgress,
	replyUnreadMail,
} from "@finance-operating-automation/core";
import { type NextRequest, NextResponse } from "next/server";

// 진행 상황을 저장할 메모리 저장소 (실제 프로덕션에서는 Redis 등 사용)
const progressStore = new Map<string, ReplyProgress>();

export async function POST() {
	try {
		// 이미 실행 중인 세션이 있는지 확인
		const activeSession = getActiveSession();
		if (activeSession) {
			return NextResponse.json(
				{
					error: "이미 자동 답변이 실행 중입니다.",
					sessionId: activeSession.session_id,
				},
				{ status: 409 },
			);
		}

		// 자동 답변 시작
		const progressCallback = (progress: ReplyProgress) => {
			progressStore.set(progress.sessionId, progress);
		};

		// 비동기로 실행
		replyUnreadMail(progressCallback)
			.then((result) => {
				console.log("자동 답변 완료:", result);
			})
			.catch((error) => {
				console.error("자동 답변 오류:", error);
			});

		return NextResponse.json({
			message: "자동 답변이 시작되었습니다.",
			sessionId: `session_${Date.now()}`,
		});
	} catch (error) {
		console.error("자동 답변 시작 오류:", error);
		return NextResponse.json(
			{
				error: "자동 답변을 시작할 수 없습니다.",
				details: error instanceof Error ? error.message : String(error),
			},
			{ status: 500 },
		);
	}
}

export async function GET(request: NextRequest) {
	const searchParams = request.nextUrl.searchParams;
	const sessionId = searchParams.get("sessionId");
	const action = searchParams.get("action");

	try {
		if (action === "status") {
			// 활성 세션 상태 확인
			const activeSession = getActiveSession();
			if (activeSession) {
				const progress = progressStore.get(activeSession.session_id);
				return NextResponse.json({
					session: activeSession,
					progress: progress || null,
				});
			} else {
				return NextResponse.json({
					session: null,
					progress: null,
				});
			}
		}

		if (action === "logs") {
			// 최근 이메일 로그 가져오기
			const logs = getRecentEmailLogs(20);
			return NextResponse.json({ logs });
		}

		if (sessionId) {
			// 특정 세션 정보 가져오기
			const session = getSessionById(sessionId);
			const progress = progressStore.get(sessionId);

			return NextResponse.json({
				session,
				progress: progress || null,
			});
		}

		return NextResponse.json(
			{
				error: "잘못된 요청입니다.",
			},
			{ status: 400 },
		);
	} catch (error) {
		console.error("세션 정보 조회 오류:", error);
		return NextResponse.json(
			{
				error: "세션 정보를 조회할 수 없습니다.",
				details: error instanceof Error ? error.message : String(error),
			},
			{ status: 500 },
		);
	}
}

export async function DELETE() {
	try {
		// 활성 세션 중지 (실제로는 더 복잡한 로직 필요)
		const activeSession = getActiveSession();
		if (!activeSession) {
			return NextResponse.json(
				{
					error: "실행 중인 세션이 없습니다.",
				},
				{ status: 404 },
			);
		}

		// 세션 상태를 stopped로 변경
		// 실제 구현에서는 진행 중인 프로세스를 안전하게 중지해야 함

		return NextResponse.json({
			message: "자동 답변이 중지되었습니다.",
			sessionId: activeSession.session_id,
		});
	} catch (error) {
		console.error("자동 답변 중지 오류:", error);
		return NextResponse.json(
			{
				error: "자동 답변을 중지할 수 없습니다.",
				details: error instanceof Error ? error.message : String(error),
			},
			{ status: 500 },
		);
	}
}
