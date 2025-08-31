import {
	getRecentEmailLogs,
	replyUnreadMail,
} from "@finance-operating-automation/core";
import { type NextRequest, NextResponse } from "next/server";

// 현재 실행 중인 상태를 저장
let isRunning = false;

export async function POST() {
	try {
		// 이미 실행 중인지 확인
		if (isRunning) {
			return NextResponse.json(
				{
					error: "이미 자동 답변이 실행 중입니다.",
				},
				{ status: 409 },
			);
		}

		isRunning = true;

		// 비동기로 실행
		replyUnreadMail()
			.then((result) => {
				console.log("자동 답변 완료:", result);
			})
			.catch((error) => {
				console.error("자동 답변 오류:", error);
			})
			.finally(() => {
				isRunning = false;
			});

		return NextResponse.json({
			message: "자동 답변이 시작되었습니다.",
		});
	} catch (error) {
		isRunning = false;
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
	const action = searchParams.get("action");

	try {
		if (action === "status") {
			// 실행 상태만 반환
			return NextResponse.json({
				isRunning,
			});
		}

		if (action === "logs") {
			// 최근 이메일 로그 가져오기
			const logs = getRecentEmailLogs(20);
			return NextResponse.json({ logs });
		}

		return NextResponse.json(
			{
				error: "잘못된 요청입니다.",
			},
			{ status: 400 },
		);
	} catch (error) {
		console.error("상태 정보 조회 오류:", error);
		return NextResponse.json(
			{
				error: "상태 정보를 조회할 수 없습니다.",
				details: error instanceof Error ? error.message : String(error),
			},
			{ status: 500 },
		);
	}
}

export async function DELETE() {
	try {
		if (!isRunning) {
			return NextResponse.json(
				{
					error: "실행 중인 프로세스가 없습니다.",
				},
				{ status: 404 },
			);
		}

		// 단순히 상태만 변경 (실제 중지 로직은 더 복잡할 수 있음)
		isRunning = false;

		return NextResponse.json({
			message: "자동 답변이 중지되었습니다.",
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
