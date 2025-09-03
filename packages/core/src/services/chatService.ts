import {
	type ChatMessage,
	createChatMessage,
	findChatMessagesBySessionId,
} from "../models/ChatMessage";

/**
 * 채팅 메시지를 데이터베이스에 저장합니다.
 * @param message - 저장할 메시지 객체
 */
export function saveChatMessage(
	message: Omit<ChatMessage, "id" | "created_at">,
): void {
	try {
		createChatMessage(message);
	} catch (error) {
		console.error("Failed to save chat message:", error);
		// 여기에 에러 처리 로직을 추가할 수 있습니다.
	}
}

/**
 * 특정 세션의 채팅 내역을 불러옵니다.
 * @param sessionId - 조회할 세션의 ID
 * @param limit - 불러올 메시지의 최대 개수
 * @returns 채팅 메시지 배열
 */
export function getChatHistory(
	sessionId: string,
	limit: number = 50,
): ChatMessage[] {
	try {
		return findChatMessagesBySessionId(sessionId, limit);
	} catch (error) {
		console.error("Failed to get chat history:", error);
		return [];
	}
}
