import db from "../database";

export interface ChatMessage {
	id?: number;
	session_id: string;
	sender: "user" | "ai";
	content: string;
	created_at?: string;
}

// 새로운 채팅 메시지 생성
export const createChatMessage = (
	message: Omit<ChatMessage, "id" | "created_at">,
): ChatMessage => {
	const stmt = db.prepare(
		"INSERT INTO chat_messages (session_id, sender, content) VALUES (?, ?, ?)",
	);
	const result = stmt.run(message.session_id, message.sender, message.content);
	const inserted = findChatMessageById(result.lastInsertRowid as number);
	if (!inserted) {
		throw new Error("Failed to create chat message");
	}
	return inserted;
};

// 세션 ID로 채팅 내역 조회
export const findChatMessagesBySessionId = (
	sessionId: string,
	limit: number = 50,
): ChatMessage[] => {
	const stmt = db.prepare(
		"SELECT * FROM chat_messages WHERE session_id = ? ORDER BY created_at ASC LIMIT ?",
	);
	return stmt.all(sessionId, limit) as ChatMessage[];
};

// ID로 채팅 메시지 조회
export const findChatMessageById = (id: number): ChatMessage | null => {
	const stmt = db.prepare("SELECT * FROM chat_messages WHERE id = ?");
	return stmt.get(id) as ChatMessage | null;
};
