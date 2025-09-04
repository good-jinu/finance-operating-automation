import {
	deleteTableRow,
	updateTableRow,
} from "@finance-operating-automation/core/services";
import { type NextRequest, NextResponse } from "next/server";

export async function PUT(
	req: NextRequest,
	{ params }: { params: Promise<{ tableName: string; id: string }> },
) {
	try {
		const { tableName, id } = await params;
		const body = await req.json();
		const success = await updateTableRow(tableName, Number(id), body);
		if (success) {
			return new NextResponse(null, { status: 204 });
		} else {
			return new NextResponse("Update failed", { status: 400 });
		}
	} catch (error) {
		const resolvedParams = await params;
		console.error(
			`Error updating data for table ${resolvedParams.tableName}, id ${resolvedParams.id}:`,
			error,
		);
		return new NextResponse("Internal Server Error", { status: 500 });
	}
}

export async function DELETE(
	_req: NextRequest,
	{ params }: { params: Promise<{ tableName: string; id: string }> },
) {
	try {
		const { tableName, id } = await params;
		const success = await deleteTableRow(tableName, Number(id));
		if (success) {
			return new NextResponse(null, { status: 204 });
		} else {
			return new NextResponse("Delete failed", { status: 400 });
		}
	} catch (error) {
		const resolvedParams = await params;
		console.error(
			`Error deleting data for table ${resolvedParams.tableName}, id ${resolvedParams.id}:`,
			error,
		);
		return new NextResponse("Internal Server Error", { status: 500 });
	}
}
