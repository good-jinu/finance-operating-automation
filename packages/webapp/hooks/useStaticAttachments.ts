import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

interface DownloadStaticAttachmentParams {
	filename: string;
}

export function useDownloadStaticAttachment() {
	return useMutation({
		mutationFn: async ({ filename }: DownloadStaticAttachmentParams) => {
			const encodedFilename = encodeURIComponent(filename);
			const response = await fetch(
				`/api/attachments/static/${encodedFilename}`,
			);

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || "첨부파일 다운로드에 실패했습니다");
			}

			// 파일 다운로드
			const blob = await response.blob();
			const url = window.URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = filename;
			document.body.appendChild(a);
			a.click();
			window.URL.revokeObjectURL(url);
			document.body.removeChild(a);

			return { filename, success: true };
		},
		onSuccess: (data) => {
			toast.success(`${data.filename} 파일이 다운로드되었습니다`);
		},
		onError: (error) => {
			toast.error(error.message);
		},
	});
}
