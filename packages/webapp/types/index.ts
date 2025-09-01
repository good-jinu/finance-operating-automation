export interface GmailMessage {
	id?: number;
	message_id: string;
	thread_id: string;
	subject?: string;
	sender: string;
	recipient: string;
	body?: string;
	snippet?: string;
	labels?: string;
	internal_date?: string;
	size_estimate?: number;
	is_unread: boolean;
	has_attachments: boolean;
	created_at?: string;
	updated_at?: string;
}

export interface Attachment {
	id?: number;
	message_id: string;
	file_name: string;
	created_at?: string;
	updated_at?: string;
}
