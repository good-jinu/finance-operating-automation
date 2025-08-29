import type { gmail_v1 } from "googleapis";
import { htmlToText } from "html-to-text";

/**
 * 문자열에서 이메일을 추출합니다.
 */
export function extractEmail(text: string): string | null {
	const matches = text.match(
		/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/g,
	);
	return matches ? matches[0] : null;
}

/**
 * Gmail 메시지 headers 배열을 Record<string, string>으로 변환합니다.
 */
export function headersToRecord(
	headers: gmail_v1.Schema$MessagePartHeader[],
): Record<string, string> {
	return (headers || []).reduce(
		(acc, h) => {
			if (h.name && h.value) {
				acc[h.name] = h.value;
			}
			return acc;
		},
		{} as Record<string, string>,
	);
}

/**
 * 주어진 이름의 헤더 값을 반환합니다. 없으면 undefined.
 */
export function getHeader(
	headers: gmail_v1.Schema$MessagePartHeader[],
	name: string,
): string | undefined {
	const nameLower = name.toLowerCase();
	for (const h of headers || []) {
		if ((h.name || "").toLowerCase() === nameLower) {
			return h.value || undefined;
		}
	}
	return undefined;
}

/**
 * Gmail API가 제공하는 base64url 인코딩 본문을 디코드하여 문자열을 반환합니다.
 */
function decodeBase64UrlSafe(data: string): string {
	if (!data) {
		return "";
	}
	try {
		return Buffer.from(data, "base64url").toString("utf-8");
	} catch (e) {
		console.error(`Error decoding base64url: ${e}`);
		// 디코딩 실패 시 안전하게 빈 문자열 반환
		return "";
	}
}

/**
 * HTML 문자열을 가독성 있는 텍스트로 변환합니다.
 */
function convertHtmlToText(html: string): string {
	if (!html) {
		return "";
	}
	return htmlToText(html, { wordwrap: false });
}

/**
 * 단일 part에서 (mimeType, text) 추출. text는 text/plain 우선, 없으면 text/html을 텍스트로 변환.
 */
function extractFromPart(part: gmail_v1.Schema$MessagePart): {
	mimeType?: string | null;
	text?: string | null;
} {
	const mime = part.mimeType;
	const data = part.body?.data;

	if (mime?.startsWith("multipart/")) {
		const text = extractTextFromPayload(part);
		return { mimeType: mime, text };
	}

	if (mime === "text/plain") {
		return { mimeType: mime, text: decodeBase64UrlSafe(data || "") };
	}

	if (mime === "text/html") {
		const html = decodeBase64UrlSafe(data || "");
		return { mimeType: mime, text: convertHtmlToText(html) };
	}

	return { mimeType: mime, text: null };
}

/**
 * Gmail 메시지 payload에서 본문 텍스트를 추출합니다.
 * - multipart 계층을 재귀적으로 탐색
 * - text/plain을 우선, 없으면 text/html을 변환하여 사용
 * - 상위 body.data가 있으면 그대로 사용
 */
export function extractTextFromPayload(
	payload: gmail_v1.Schema$MessagePart,
): string {
	if (!payload) {
		return "";
	}

	if (payload.body?.data) {
		const mime = payload.mimeType;
		const text = decodeBase64UrlSafe(payload.body.data);
		if (mime === "text/html") {
			return convertHtmlToText(text);
		}
		return text;
	}

	const parts = payload.parts || [];
	if (!parts.length) {
		return "";
	}

	let plainCandidate: string | null = null;
	let htmlCandidate: string | null = null;

	for (const part of parts) {
		const { mimeType, text } = extractFromPart(part);
		if (!text) {
			continue;
		}
		if (mimeType === "text/plain" && !plainCandidate) {
			plainCandidate = text;
		}
		if (mimeType === "text/html" && !htmlCandidate) {
			htmlCandidate = text;
		}
		if (
			mimeType?.startsWith("multipart/") &&
			!plainCandidate &&
			!htmlCandidate
		) {
			if (text) {
				plainCandidate = text;
			}
		}
	}

	return plainCandidate || htmlCandidate || "";
}
