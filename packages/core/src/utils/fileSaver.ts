import * as fs from "node:fs";
import * as path from "node:path";
import type { gmail_v1 } from "googleapis";
import { FILE_PATH } from "./config";

export interface AttachmentInfo {
	filename: string;
	mimeType: string;
	attachmentId: string;
}

/**
 * 지정된 경로에 디렉토리를 생성합니다 (재귀적으로)
 */
function ensureDirectoryExists(dirPath: string): void {
	if (!fs.existsSync(dirPath)) {
		fs.mkdirSync(dirPath, { recursive: true });
	}
}

/**
 * 첨부파일을 로컬 파일 시스템에 저장합니다.
 */
export function saveAttachment(
	messageId: string,
	filename: string,
	buffer: Buffer,
): string {
	try {
		// 저장할 디렉토리 경로 생성: .storage/files/${message_id}/
		const messageDir = path.join(process.cwd(), FILE_PATH, messageId);
		ensureDirectoryExists(messageDir);

		// 저장할 파일 경로: .storage/files/${message_id}/${filename}
		const filePath = path.join(messageDir, filename);

		// 파일 저장
		fs.writeFileSync(filePath, buffer);

		console.log(`첨부파일 저장 완료: ${filePath}`);
		return filePath;
	} catch (error) {
		console.error(
			`첨부파일 저장 중 오류 발생 (${messageId}/${filename}):`,
			error,
		);
		throw error;
	}
}

/**
 * 메시지 페이로드에서 모든 첨부파일 정보를 추출합니다.
 */
export function extractAllAttachments(
	payload: gmail_v1.Schema$MessagePart,
): AttachmentInfo[] {
	const attachments: AttachmentInfo[] = [];

	function extractFromPart(part: gmail_v1.Schema$MessagePart): void {
		// 현재 파트가 첨부파일인지 확인
		if (part.filename && part.filename.length > 0 && part.body?.attachmentId) {
			attachments.push({
				filename: part.filename,
				mimeType: part.mimeType || "application/octet-stream",
				attachmentId: part.body.attachmentId,
			});
		}

		// 중첩된 파트들도 재귀적으로 확인
		if (part.parts && Array.isArray(part.parts)) {
			for (const subPart of part.parts) {
				extractFromPart(subPart);
			}
		}
	}

	if (payload) {
		extractFromPart(payload);
	}

	return attachments;
}
