import db from "../database";

export interface AutoReplySession {
	id?: number;
	session_id: string;
	status: "running" | "completed" | "stopped" | "error";
	total_emails: number;
	processed_emails: number;
	success_count: number;
	error_count: number;
	created_at?: string;
	updated_at?: string;
}

export function createAutoReplySession(
	sessionData: Omit<AutoReplySession, "id" | "created_at" | "updated_at">,
): AutoReplySession {
	const stmt = db.prepare(`
    INSERT INTO auto_reply_sessions (session_id, status, total_emails, processed_emails, success_count, error_count)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

	const result = stmt.run(
		sessionData.session_id,
		sessionData.status,
		sessionData.total_emails,
		sessionData.processed_emails,
		sessionData.success_count,
		sessionData.error_count,
	);

	const session = findAutoReplySessionById(result.lastInsertRowid as number);
	if (!session) {
		throw new Error("Failed to create auto-reply session");
	}
	return session;
}

export function findAutoReplySessionById(id: number): AutoReplySession | null {
	const stmt = db.prepare("SELECT * FROM auto_reply_sessions WHERE id = ?");
	return stmt.get(id) as AutoReplySession | null;
}

export function findAutoReplySessionBySessionId(
	sessionId: string,
): AutoReplySession | null {
	const stmt = db.prepare(
		"SELECT * FROM auto_reply_sessions WHERE session_id = ?",
	);
	return stmt.get(sessionId) as AutoReplySession | null;
}

export function updateAutoReplySessionProgress(
	sessionId: string,
	processedEmails: number,
	successCount: number,
	errorCount: number,
): boolean {
	const stmt = db.prepare(`
    UPDATE auto_reply_sessions 
    SET processed_emails = ?, success_count = ?, error_count = ?, updated_at = CURRENT_TIMESTAMP
    WHERE session_id = ?
  `);

	const result = stmt.run(processedEmails, successCount, errorCount, sessionId);
	return result.changes > 0;
}

export function updateAutoReplySessionStatus(
	sessionId: string,
	status: AutoReplySession["status"],
): boolean {
	const stmt = db.prepare(`
    UPDATE auto_reply_sessions 
    SET status = ?, updated_at = CURRENT_TIMESTAMP
    WHERE session_id = ?
  `);

	const result = stmt.run(status, sessionId);
	return result.changes > 0;
}

export function findActiveAutoReplySession(): AutoReplySession | null {
	const stmt = db.prepare(
		"SELECT * FROM auto_reply_sessions WHERE status = ? ORDER BY created_at DESC LIMIT 1",
	);
	return stmt.get("running") as AutoReplySession | null;
}

export function findRecentAutoReplySessions(
	limit: number = 5,
): AutoReplySession[] {
	const stmt = db.prepare(
		"SELECT * FROM auto_reply_sessions ORDER BY created_at DESC LIMIT ?",
	);
	return stmt.all(limit) as AutoReplySession[];
}
