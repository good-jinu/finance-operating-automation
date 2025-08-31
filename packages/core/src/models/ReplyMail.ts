import db from "../database";

export interface ReplyMail {
	id?: number;
	original_message_id: number;
	subject: string;
	reply_body: string;
	attachments?: string; // JSON string of attachments
	is_sent: boolean;
	sent_at?: string;
	created_at?: string;
	updated_at?: string;
}

export interface ReplyMailWithOriginal extends ReplyMail {
	original_sender: string;
	original_subject: string;
	original_body?: string;
}

export function createReplyMail(
	reply: Omit<ReplyMail, "id" | "created_at" | "updated_at">,
): ReplyMail {
	const stmt = db.prepare(`
		INSERT INTO reply_mails (
			original_message_id, subject, reply_body, attachments, is_sent
		)
		VALUES (?, ?, ?, ?, ?)
	`);

	const result = stmt.run(
		reply.original_message_id,
		reply.subject,
		reply.reply_body,
		reply.attachments || null,
		reply.is_sent ? 1 : 0,
	);

	const lastInserted = findReplyMailById(result.lastInsertRowid as number);

	if (!lastInserted) {
		throw new Error("Failed to create reply mail");
	}

	return lastInserted;
}

export function findReplyMailById(id: number): ReplyMail | null {
	const stmt = db.prepare("SELECT * FROM reply_mails WHERE id = ?");
	return stmt.get(id) as ReplyMail | null;
}

export function findReplyMailsByStatus(
	is_sent: boolean,
	limit: number = 50,
): ReplyMailWithOriginal[] {
	const stmt = db.prepare(`
		SELECT 
			rm.*,
			gm.sender as original_sender,
			gm.subject as original_subject,
			gm.body as original_body
		FROM reply_mails rm
		INNER JOIN gmail_messages gm ON rm.original_message_id = gm.id
		WHERE rm.is_sent = ?
		ORDER BY rm.created_at DESC
		LIMIT ?
	`);
	return stmt.all(is_sent ? 1 : 0, limit) as ReplyMailWithOriginal[];
}

export function findAllReplyMails(limit: number = 50): ReplyMailWithOriginal[] {
	const stmt = db.prepare(`
		SELECT 
			rm.*,
			gm.sender as original_sender,
			gm.subject as original_subject,
			gm.body as original_body
		FROM reply_mails rm
		INNER JOIN gmail_messages gm ON rm.original_message_id = gm.id
		ORDER BY rm.created_at DESC
		LIMIT ?
	`);
	return stmt.all(limit) as ReplyMailWithOriginal[];
}

export function updateReplyMailSentStatus(
	id: number,
	is_sent: boolean,
	sent_at?: string,
): boolean {
	const stmt = db.prepare(`
		UPDATE reply_mails 
		SET is_sent = ?, sent_at = ?, updated_at = CURRENT_TIMESTAMP
		WHERE id = ?
	`);

	const result = stmt.run(is_sent ? 1 : 0, sent_at || null, id);
	return result.changes > 0;
}

export function countReplyMails(): number {
	const stmt = db.prepare("SELECT COUNT(*) as count FROM reply_mails");
	const result = stmt.get() as { count: number };
	return result.count;
}

export function countUnsentReplyMails(): number {
	const stmt = db.prepare(
		"SELECT COUNT(*) as count FROM reply_mails WHERE is_sent = 0",
	);
	const result = stmt.get() as { count: number };
	return result.count;
}
