import { useState } from "react";
import { toast } from "sonner";
import type { Attachment } from "@/types";

export function useAttachments() {
	const [attachments, setAttachments] = useState<Attachment[]>([]);
	const [isLoading, setIsLoading] = useState(false);

	const loadAttachments = async (messageId: string) => {
		setIsLoading(true);
		try {
			const response = await fetch(`/api/attachments/${messageId}`);
			const result = await response.json();

			if (result.success) {
				setAttachments(result.data);
				return result.data;
			} else {
				toast.error("첨부파일 목록을 불러오는데 실패했습니다.");
				return [];
			}
		} catch (error) {
			console.error("Failed to load attachments:", error);
			toast.error("첨부파일 목록을 불러오는데 실패했습니다.");
			return [];
		} finally {
			setIsLoading(false);
		}
	};

	const downloadAttachment = async (messageId: string, fileName: string) => {
		try {
			const response = await fetch(
				`/api/attachments/${messageId}?fileName=${encodeURIComponent(fileName)}`,
			);

			if (!response.ok) {
				throw new Error("다운로드에 실패했습니다.");
			}

			const blob = await response.blob();
			const url = window.URL.createObjectURL(blob);
			const link = document.createElement("a");
			link.href = url;
			link.download = fileName;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			window.URL.revokeObjectURL(url);

			toast.success(`${fileName} 다운로드가 완료되었습니다.`);
		} catch (error) {
			console.error("Failed to download attachment:", error);
			toast.error("첨부파일 다운로드에 실패했습니다.");
		}
	};

	return {
		attachments,
		isLoading,
		loadAttachments,
		downloadAttachment,
	};
}
