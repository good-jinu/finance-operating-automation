import {
	downloadAttachment,
	getAttachmentsByMessageId,
} from "@finance-operating-automation/core/services";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(
	request: NextRequest,
	// biome-ignore lint:suspicious/noExplicitAny
	{ params }: { params: any },
) {
	const { messageId } = await params;

	try {
		const { searchParams } = new URL(request.url);
		const fileName = searchParams.get("fileName");

		if (fileName) {
			// 특정 파일 다운로드
			const { buffer, contentType, attachmentFilename } = downloadAttachment(
				messageId,
				fileName,
			);

			return new NextResponse(new Uint8Array(buffer), {
				status: 200,
				headers: {
					"Content-Type": contentType,
					"Content-Disposition": `attachment; filename="${encodeURIComponent(attachmentFilename)}"`,
				},
			});
		} else {
			// 메시지의 첨부파일 목록 조회
			const attachments = getAttachmentsByMessageId(messageId);

			return NextResponse.json({
				success: true,
				data: attachments,
			});
		}
	} catch (error) {
		console.error("Error handling attachment request:", error);
		return NextResponse.json(
			{
				success: false,
				error:
					error instanceof Error ? error.message : "Unknown error occurred",
			},
			{ status: 500 },
		);
	}
}
