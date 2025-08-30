import {buildGmailService, getCredentials, GmailClient} from "@finance-operating-automation/core/services";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
	try {
		const { maxResults = 100, query = "" } = await request.json();

		const creds = await getCredentials();
		const service = buildGmailService(creds);
		const gmailClient = new GmailClient(service);
		const result = await gmailClient.syncMails("me", query, maxResults);

		return NextResponse.json({
			success: true,
			data: result,
		});
	} catch (error) {
		console.error("Error syncing mails:", error);
		return NextResponse.json(
			{ success: false, error: "Failed to sync mails" },
			{ status: 500 },
		);
	}
}
