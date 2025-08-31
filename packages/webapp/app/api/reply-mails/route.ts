import { getReplyMails } from "@finance-operating-automation/core/services";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const unsentOnly = searchParams.get("unsentOnly") === "true";
		const limit = parseInt(searchParams.get("limit") || "50");

		const { replyMails, totalCount } = getReplyMails(unsentOnly, limit);

		return NextResponse.json({
			success: true,
			data: replyMails,
			total: totalCount,
		});
	} catch (error) {
		console.error("Error fetching reply mails:", error);
		return NextResponse.json(
			{ success: false, error: "Failed to fetch reply mails" },
			{ status: 500 },
		);
	}
}
