import type { Database } from "better-sqlite3";

export const createChatTables = (db: Database) => {
	// 채팅 메시지 테이블
	db.exec(`
    CREATE TABLE IF NOT EXISTS chat_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id TEXT,
      sender TEXT NOT NULL CHECK(sender IN ('user', 'ai')),
      content TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
};
