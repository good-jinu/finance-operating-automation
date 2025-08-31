/**
 * Gmail API 접근 권한 범위
 * 읽기 + 발송 권한으로 구성합니다.
 */
export const SCOPES = [
	"https://www.googleapis.com/auth/gmail.readonly",
	"https://www.googleapis.com/auth/gmail.send",
	"https://www.googleapis.com/auth/gmail.compose",
];

/**
 * 자격 증명/토큰 파일 경로
 */
export const TOKEN_PATH = "token.json";
export const CREDENTIALS_PATH = "credentials.json";

/**
 * 기본 검색 쿼리
 */
export const DEFAULT_QUERY = "is:unread";

/**
 * 데이터베이스 및 스토리지 파일 경로
 */
export const DATABASE_PATH = ".storage/database.db";
export const FILE_PATH = ".storage/files";
