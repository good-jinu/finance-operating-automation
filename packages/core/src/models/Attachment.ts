import db from "../database";

export interface Attachment {
	id?: number;
	message_id: string;
	file_name: string;
	created_at?: string;
	updated_at?: string;
}

export function createAttachment(
	attachment: Omit<Attachment, "id" | "created_at" | "updated_at">,
): Attachment {
	const stmt = db.prepare(`
		INSERT INTO attachments (message_id, file_name)
		VALUES (?, ?)
	`);

	const result = stmt.run(attachment.message_id, attachment.file_name);

	const lastInserted = findAttachmentById(result.lastInsertRowid as number);

	if (!lastInserted) {
		throw new Error("Failed to create attachment");
	}

	return lastInserted;
}

export function findAttachmentById(id: number): Attachment | null {
	const stmt = db.prepare("SELECT * FROM attachments WHERE id = ?");
	return stmt.get(id) as Attachment | null;
}

export function findAttachmentsByMessageId(messageId: string): Attachment[] {
	const stmt = db.prepare(
		"SELECT * FROM attachments WHERE message_id = ? ORDER BY created_at ASC",
	);
	return stmt.all(messageId) as Attachment[];
}

export function deleteAttachmentsByMessageId(messageId: string): number {
	const stmt = db.prepare("DELETE FROM attachments WHERE message_id = ?");
	const result = stmt.run(messageId);
	return result.changes;
}

export function findAttachmentByMessageIdAndFileName(
	messageId: string,
	fileName: string,
): Attachment | null {
	const stmt = db.prepare(
		"SELECT * FROM attachments WHERE message_id = ? AND file_name = ?",
	);
	return stmt.get(messageId, fileName) as Attachment | null;
}
