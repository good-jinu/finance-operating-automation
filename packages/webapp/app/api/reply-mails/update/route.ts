import { updateReplyMail } from "@finance-operating-automation/core/services";
import { type NextRequest, NextResponse } from "next/server";

export async function PUT(request: NextRequest) {
	try {
		const body = await request.json();
		const { id, subject, reply_body } = body;

		if (!id || !subject || !reply_body) {
			return NextResponse.json(
				{ success: false, error: "Missing required fields" },
				{ status: 400 },
			);
		}

		const updated = updateReplyMail(id, subject, reply_body);

		return NextResponse.json({
			success: true,
			data: { updated: true },
		});
	} catch (error) {
		console.error("Error updating reply mail:", error);

		// 구체적인 에러 메시지 반환
		const errorMessage =
			error instanceof Error ? error.message : "Failed to update reply mail";
		const statusCode = errorMessage.includes("not found")
			? 404
			: errorMessage.includes("already sent")
				? 409
				: errorMessage.includes("cannot be empty")
					? 400
					: 500;

		return NextResponse.json(
			{ success: false, error: errorMessage },
			{ status: statusCode },
		);
	}
}
