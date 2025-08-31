import { sendReplyMail } from "@finance-operating-automation/core/services";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const { replyMailId } = body;

		if (!replyMailId) {
			return NextResponse.json(
				{ success: false, error: "Reply mail ID is required" },
				{ status: 400 },
			);
		}

		const result = await sendReplyMail(replyMailId);

		return NextResponse.json({
			success: true,
			data: { sent: result },
		});
	} catch (error) {
		console.error("Error sending reply mail:", error);
		return NextResponse.json(
			{
				success: false,
				error:
					error instanceof Error ? error.message : "Failed to send reply mail",
			},
			{ status: 500 },
		);
	}
}
