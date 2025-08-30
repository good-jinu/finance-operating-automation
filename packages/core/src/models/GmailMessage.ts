import db from "../database";

export interface GmailMessage {
	id?: number;
	message_id: string;
	thread_id: string;
	subject?: string;
	sender: string;
	recipient: string;
	body?: string;
	snippet?: string;
	labels?: string; // JSON string of label array
	internal_date?: string;
	size_estimate?: number;
	is_unread: boolean;
	has_attachments: boolean;
	created_at?: string;
	updated_at?: string;
}

export function createGmailMessage(
	message: Omit<GmailMessage, "id" | "created_at" | "updated_at">,
): GmailMessage {
	const stmt = db.prepare(`
		INSERT INTO gmail_messages (
			message_id, thread_id, subject, sender, recipient, body, snippet, 
			labels, internal_date, size_estimate, is_unread, has_attachments
		)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
	`);

	const result = stmt.run(
		message.message_id,
		message.thread_id,
		message.subject || null,
		message.sender,
		message.recipient,
		message.body || null,
		message.snippet || null,
		message.labels || null,
		message.internal_date || null,
		message.size_estimate || null,
		message.is_unread ? 1 : 0,
		message.has_attachments ? 1 : 0,
	);

	const lastInserted = findGmailMessageById(result.lastInsertRowid as number);

	if (!lastInserted) {
		throw new Error("Failed to create gmail message");
	}

	return lastInserted;
}

export function findGmailMessageById(id: number): GmailMessage | null {
	const stmt = db.prepare("SELECT * FROM gmail_messages WHERE id = ?");
	return stmt.get(id) as GmailMessage | null;
}

export function findGmailMessageByMessageId(
	messageId: string,
): GmailMessage | null {
	const stmt = db.prepare("SELECT * FROM gmail_messages WHERE message_id = ?");
	return stmt.get(messageId) as GmailMessage | null;
}

export function updateGmailMessageReadStatus(
	messageId: string,
	isUnread: boolean,
): boolean {
	const stmt = db.prepare(`
		UPDATE gmail_messages 
		SET is_unread = ?, updated_at = CURRENT_TIMESTAMP
		WHERE message_id = ?
	`);

	const result = stmt.run(isUnread ? 1 : 0, messageId);
	return result.changes > 0;
}

export function findRecentGmailMessages(limit: number = 50): GmailMessage[] {
	const stmt = db.prepare(
		"SELECT * FROM gmail_messages ORDER BY internal_date DESC, created_at DESC LIMIT ?",
	);
	return stmt.all(limit) as GmailMessage[];
}

export function countGmailMessages(): number {
	const stmt = db.prepare("SELECT COUNT(*) as count FROM gmail_messages");
	const result = stmt.get() as { count: number };
	return result.count;
}

export function countUnreadGmailMessages(): number {
	const stmt = db.prepare(
		"SELECT COUNT(*) as count FROM gmail_messages WHERE is_unread = 1",
	);
	const result = stmt.get() as { count: number };
	return result.count;
}

export function findUnreadGmailMessages(
	limit: number = 50,
	offset: number = 0,
): GmailMessage[] {
	const stmt = db.prepare(
		"SELECT * FROM gmail_messages WHERE is_unread = 1 ORDER BY internal_date DESC, created_at DESC LIMIT ? OFFSET ?",
	);
	return stmt.all(limit, offset) as GmailMessage[];
}
