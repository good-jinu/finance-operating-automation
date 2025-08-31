import * as fs from "node:fs";
import * as path from "node:path";
import { FILE_PATH } from "../utils/config";
import {
	type AttachmentInfo,
	getMimeType,
	readAttachment,
} from "../utils/fileReader";

/**
 * filename으로 파일을 읽어서 버퍼와 메타데이터를 반환합니다.
 */
export function readFileByFilename(filename: string): {
	buffer: Buffer;
	contentType: string;
	attachmentFilename: string;
} {
	const filePath = path.join(process.cwd(), FILE_PATH, filename);

	// 파일 존재 확인
	if (!fs.existsSync(filePath)) {
		throw new Error(`파일을 찾을 수 없습니다: ${filename}`);
	}

	// 파일 읽기
	const buffer = fs.readFileSync(filePath);
	const contentType = getMimeType(filePath);
	const attachmentFilename = path.basename(filename);

	return {
		buffer,
		contentType,
		attachmentFilename,
	};
}

/**
 * filename으로 첨부파일 정보를 읽어서 AttachmentInfo로 반환합니다.
 */
export function getAttachmentInfo(filename: string): AttachmentInfo {
	return readAttachment(filename);
}
