import { generateRepliesForMails } from "@finance-operating-automation/core/services";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const { mailIds } = body;

		if (!mailIds || !Array.isArray(mailIds) || mailIds.length === 0) {
			return NextResponse.json(
				{
					success: false,
					error: "mailIds are required and must be a non-empty array",
				},
				{ status: 400 },
			);
		}

		// mailIds를 숫자로 변환
		const numericMailIds = mailIds.map((id) => parseInt(id, 10));
		if (numericMailIds.some(Number.isNaN)) {
			return NextResponse.json(
				{
					success: false,
					error: "All mailIds must be valid numbers",
				},
				{ status: 400 },
			);
		}

		const result = await generateRepliesForMails(numericMailIds);

		return NextResponse.json({
			success: true,
			data: result,
		});
	} catch (error) {
		console.error("Error generating replies:", error);
		return NextResponse.json(
			{
				success: false,
				error:
					error instanceof Error ? error.message : "Failed to generate replies",
			},
			{ status: 500 },
		);
	}
}
