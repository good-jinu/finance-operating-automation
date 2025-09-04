import { removeReplyMail } from "@finance-operating-automation/core/services";
import { type NextRequest, NextResponse } from "next/server";

export async function DELETE(request: NextRequest) {
	try {
		const body = await request.json();
		const { id } = body;

		if (!id) {
			return NextResponse.json(
				{ success: false, error: "Missing reply mail ID" },
				{ status: 400 },
			);
		}

		const deleted = removeReplyMail(id);

		return NextResponse.json({
			success: true,
			data: { deleted: true },
		});
	} catch (error) {
		console.error("Error deleting reply mail:", error);

		// 구체적인 에러 메시지 반환
		const errorMessage = error instanceof Error ? error.message : "Failed to delete reply mail";
		const statusCode = errorMessage.includes("not found") ? 404 : 
						   errorMessage.includes("already sent") ? 409 : 500;

		return NextResponse.json(
			{ success: false, error: errorMessage },
			{ status: statusCode },
		);
	}
}
