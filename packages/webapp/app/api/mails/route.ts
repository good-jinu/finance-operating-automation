import {
	buildGmailService,
	GmailClient,
	getCredentials,
} from "@finance-operating-automation/core/services";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
	try {
		const searchParams = request.nextUrl.searchParams;
		const limit = parseInt(searchParams.get("limit") || "50", 10);
		const offset = parseInt(searchParams.get("offset") || "0", 10);
		const isUnreadOnly = searchParams.get("unreadOnly") === "true";

		// Gmail 서비스는 실제 환경에서는 인증된 서비스로 교체해야 합니다
		// 여기서는 일시적으로 null로 처리하고 직접 DB에서 조회합니다

		const creds = await getCredentials();
		const service = buildGmailService(creds);
		const gmailClient = new GmailClient(service);
		const mails = await gmailClient.getMailsFromDatabase(
			limit,
			offset,
			isUnreadOnly,
		);

		return NextResponse.json({
			success: true,
			data: mails,
		});
	} catch (error) {
		console.error("Error fetching mails:", error);
		return NextResponse.json(
			{ success: false, error: "Failed to fetch mails" },
			{ status: 500 },
		);
	}
}
