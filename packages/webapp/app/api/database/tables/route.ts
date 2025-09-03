import { getTableNames } from "@finance-operating-automation/core/services";
import { NextResponse } from "next/server";

export async function GET() {
	try {
		const tableNames = getTableNames();
		return NextResponse.json(tableNames);
	} catch (error) {
		console.error("Error fetching table names:", error);
		return new NextResponse("Internal Server Error", { status: 500 });
	}
}
