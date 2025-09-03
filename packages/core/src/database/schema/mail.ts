import type { Database } from "better-sqlite3";

export const createMailTables = (db: Database) => {
	// 이메일 처리 로그 테이블
	db.exec(`
    CREATE TABLE IF NOT EXISTS email_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email_id TEXT UNIQUE NOT NULL,
      sender TEXT NOT NULL,
      subject TEXT NOT NULL,
      body TEXT,
      status TEXT NOT NULL CHECK(status IN ('processing', 'success', 'error')),
      reply_body TEXT,
      attachments TEXT,
      error_message TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

	// Gmail 메시지 테이블
	db.exec(`
    CREATE TABLE IF NOT EXISTS gmail_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      message_id TEXT UNIQUE NOT NULL,
      thread_id TEXT NOT NULL,
      subject TEXT,
      sender TEXT NOT NULL,
      recipient TEXT NOT NULL,
      body TEXT,
      snippet TEXT,
      labels TEXT,
      internal_date TEXT,
      size_estimate INTEGER,
      is_unread BOOLEAN DEFAULT 1,
      has_attachments BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

	// 답변 메일 테이블
	db.exec(`
    CREATE TABLE IF NOT EXISTS reply_mails (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      original_message_id TEXT NOT NULL,
      subject TEXT NOT NULL,
      reply_body TEXT NOT NULL,
      attachments TEXT,
      is_sent BOOLEAN DEFAULT 0,
      sent_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (original_message_id) REFERENCES gmail_messages (message_id) ON DELETE CASCADE
    )
  `);

	// 첨부파일 테이블
	db.exec(`
    CREATE TABLE IF NOT EXISTS attachments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      message_id TEXT NOT NULL,
      file_name TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (message_id) REFERENCES gmail_messages (message_id) ON DELETE CASCADE
    )
  `);
};
