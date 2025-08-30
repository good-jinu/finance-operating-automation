import { join } from "node:path";
import Database from "better-sqlite3";
import { DATABASE_PATH } from "../utils/config";

const dbPath = join(process.cwd(), DATABASE_PATH);
const db = new Database(dbPath);

// 데이터베이스 테이블 초기화
const initializeDatabase = () => {
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

	// 자동 답변 세션 테이블
	db.exec(`
    CREATE TABLE IF NOT EXISTS auto_reply_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id TEXT UNIQUE NOT NULL,
      status TEXT NOT NULL CHECK(status IN ('running', 'completed', 'stopped', 'error')),
      total_emails INTEGER DEFAULT 0,
      processed_emails INTEGER DEFAULT 0,
      success_count INTEGER DEFAULT 0,
      error_count INTEGER DEFAULT 0,
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
};

// 데이터베이스 초기화 실행
initializeDatabase();

export default db;
export { initializeDatabase };
