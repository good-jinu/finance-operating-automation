import * as fs from "node:fs";
import * as path from "node:path";
import { FILE_PATH } from "./config";

/**
 * 파일 확장자를 기반으로 MIME 타입을 결정합니다.
 */
export function getMimeType(filePath: string): string {
	const ext = path.extname(filePath).toLowerCase();
	switch (ext) {
		case ".txt":
			return "text/plain";
		case ".pdf":
			return "application/pdf";
		case ".jpg":
		case ".jpeg":
			return "image/jpeg";
		case ".png":
			return "image/png";
		case ".gif":
			return "image/gif";
		case ".webp":
			return "image/webp";
		case ".csv":
			return "text/csv";
		case ".json":
			return "application/json";
		case ".zip":
			return "application/zip";
		default:
			return "application/octet-stream";
	}
}

/**
 * 파일을 읽어서 base64로 인코딩하여 반환합니다.
 */
export function readFileAsBase64(filePath: string): string {
	const fixedFilePath = path.join(process.cwd(), FILE_PATH, filePath);
	return fs.readFileSync(fixedFilePath).toString("base64");
}

/**
 * 첨부파일 정보를 담은 객체 타입
 */
export type AttachmentInfo = {
	fileName: string;
	mimeType: string;
	fileData: string;
};

/**
 * 첨부파일을 읽어서 AttachmentInfo 객체로 반환합니다.
 */
export function readAttachment(filePath: string): AttachmentInfo {
	const fileName = path.basename(filePath);
	const fixedFilePath = path.join(process.cwd(), FILE_PATH, filePath);
	const mimeType = getMimeType(fixedFilePath);
	const fileData = fs.readFileSync(fixedFilePath).toString("base64");

	return {
		fileName,
		mimeType,
		fileData,
	};
}

/**
 * 여러 첨부파일을 읽어서 AttachmentInfo 배열로 반환합니다.
 * 에러가 발생한 파일은 제외하고 성공한 파일들만 반환합니다.
 */
export function readAttachments(filePaths: string[]): AttachmentInfo[] {
	const attachments: AttachmentInfo[] = [];

	for (const filePath of filePaths) {
		try {
			const attachment = readAttachment(filePath);
			attachments.push(attachment);
		} catch (err) {
			const fixedFilePath = path.join(process.cwd(), FILE_PATH, filePath);
			console.error(`첨부파일 읽기 오류 (${fixedFilePath}):`, err);
		}
	}

	return attachments;
}
