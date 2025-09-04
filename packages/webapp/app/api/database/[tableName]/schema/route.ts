import { getTableSchema } from "@finance-operating-automation/core/services";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(
	_req: NextRequest,
	{ params }: { params: Promise<{ tableName: string }> },
) {
	const {tableName} = await params;
	try {
		const schema = await getTableSchema(tableName);
		return NextResponse.json(schema);
	} catch (error) {
		console.error(
			`Error fetching schema for table ${tableName}:`,
			error,
		);
		return new NextResponse("Internal Server Error", { status: 500 });
	}
}
