import { createGmailClient } from "@finance-operating-automation/core/services";
import { type NextRequest, NextResponse } from "next/server";

// biome-ignore lint:suspicious/noExplicitAny
export async function GET(request: NextRequest, { params }: any) {
	try {
		const { messageId, filename } = params;

		if (!messageId || !filename) {
			return NextResponse.json(
				{ error: "메시지 ID와 파일명이 필요합니다" },
				{ status: 400 },
			);
		}

		// Gmail 클라이언트 생성
		const gmailClient = await createGmailClient();

		// 첨부파일 다운로드
		const {
			buffer,
			contentType,
			filename: attachmentFilename,
		} = await gmailClient.downloadAttachment(messageId, filename);

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
