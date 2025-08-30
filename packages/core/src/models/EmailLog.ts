import db from "../database";

export interface EmailLog {
	id?: number;
	email_id: string;
	sender: string;
	subject: string;
	body?: string;
	status: "processing" | "success" | "error";
	reply_body?: string;
	attachments?: string;
	error_message?: string;
	created_at?: string;
	updated_at?: string;
}

export function createEmailLog(
	emailLog: Omit<EmailLog, "id" | "created_at" | "updated_at">,
): EmailLog {
	const stmt = db.prepare(`
    INSERT INTO email_logs (email_id, sender, subject, body, status, reply_body, attachments, error_message)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

	const result = stmt.run(
		emailLog.email_id,
		emailLog.sender,
		emailLog.subject,
		emailLog.body || null,
		emailLog.status,
		emailLog.reply_body || null,
		emailLog.attachments || null,
		emailLog.error_message || null,
	);

	const lastInserted = findEmailLogById(result.lastInsertRowid as number);

	if (!lastInserted) {
		throw new Error("Failed to create email log");
	}

	return lastInserted;
}

export function findEmailLogById(id: number): EmailLog | null {
	const stmt = db.prepare("SELECT * FROM email_logs WHERE id = ?");
	return stmt.get(id) as EmailLog | null;
}

export function findEmailLogByEmailId(emailId: string): EmailLog | null {
	const stmt = db.prepare("SELECT * FROM email_logs WHERE email_id = ?");
	return stmt.get(emailId) as EmailLog | null;
}

export function updateEmailLogStatus(
	id: number,
	status: EmailLog["status"],
	replyBody?: string,
	attachments?: string,
	errorMessage?: string,
): boolean {
	const stmt = db.prepare(`
    UPDATE email_logs 
    SET status = ?, reply_body = ?, attachments = ?, error_message = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `);

	const result = stmt.run(
		status,
		replyBody || null,
		attachments || null,
		errorMessage || null,
		id,
	);
	return result.changes > 0;
}

export function findRecentEmailLogs(limit: number = 10): EmailLog[] {
	const stmt = db.prepare(
		"SELECT * FROM email_logs ORDER BY created_at DESC LIMIT ?",
	);
	return stmt.all(limit) as EmailLog[];
}

export function countEmailLogsByStatus(status: EmailLog["status"]): number {
	const stmt = db.prepare(
		"SELECT COUNT(*) as count FROM email_logs WHERE status = ?",
	);
	const result = stmt.get(status) as { count: number };
	return result.count;
}
