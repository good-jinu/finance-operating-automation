export function parseAttachments(attachmentsString: string): string[] {
	try {
		return JSON.parse(attachmentsString) as string[];
	} catch {
		return [];
	}
}

export function formatFileSize(bytes: number): string {
	if (bytes === 0) return "0 Bytes";

	const k = 1024;
	const sizes = ["Bytes", "KB", "MB", "GB"];
	const i = Math.floor(Math.log(bytes) / Math.log(k));

	return `${parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`;
}
