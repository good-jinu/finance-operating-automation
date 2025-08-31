import { generateRepliesForUnreadMails } from "@finance-operating-automation/core/services";
import { NextResponse } from "next/server";

export async function POST() {
	try {
		const result = await generateRepliesForUnreadMails();

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
