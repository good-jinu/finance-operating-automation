import {
	createTableRow,
	getTableData,
} from "@finance-operating-automation/core/services";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(
	_req: NextRequest,
	{ params }: { params: Promise<{ tableName: string }> },
) {
	const { tableName } = await params;
	try {
		const data = await getTableData(tableName);
		return NextResponse.json(data);
	} catch (error) {
		console.error(`Error fetching data for table ${tableName}:`, error);
		return new NextResponse("Internal Server Error", { status: 500 });
	}
}

export async function POST(
	req: NextRequest,
	{ params }: { params: Promise<{ tableName: string }> },
) {
	const { tableName } = await params;
	try {
		const body = await req.json();
		const newData = await createTableRow(tableName, body);
		return NextResponse.json(newData, { status: 201 });
	} catch (error) {
		console.error(`Error creating data for table ${tableName}:`, error);
		return new NextResponse("Internal Server Error", { status: 500 });
	}
}
