import { readFileByFilename } from "@finance-operating-automation/core/services";
import { type NextRequest, NextResponse } from "next/server";

// biome-ignore lint:suspicious/noExplicitAny
export async function GET(request: NextRequest, { params }: any) {
	try {
		const { filename } = params;

		if (!filename) {
			return NextResponse.json(
				{ error: "파일명이 필요합니다" },
				{ status: 400 },
			);
		}

		// filename 으로 내부 파일 읽어서 반환
		const { buffer, contentType, attachmentFilename } =
			readFileByFilename(filename);

		// 응답 헤더 설정
		return new Response(new Uint8Array(buffer), {
			headers: {
				"Content-Type": contentType,
				"Content-Disposition": `attachment; filename="${attachmentFilename}"`,
				"Content-Length": buffer.length.toString(),
			},
		});
	} catch (error) {
		console.error("첨부파일 다운로드 중 오류:", error);
		return NextResponse.json(
			{
				error:
					error instanceof Error
						? error.message
						: "첨부파일 다운로드 중 오류가 발생했습니다",
			},
			{ status: 500 },
		);
	}
}
