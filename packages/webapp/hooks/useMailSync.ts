import { useMutation, useQueryClient } from "@tanstack/react-query";

/**
 * 어제 날짜를 Gmail API에서 사용하는 YYYY/MM/DD 형식으로 반환
 */
function getYesterdayDateString(): string {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  
  const year = yesterday.getFullYear();
  const month = String(yesterday.getMonth() + 1).padStart(2, '0');
  const day = String(yesterday.getDate()).padStart(2, '0');
  
  return `${year}/${month}/${day}`;
}

/**
 * 어제 날짜 이후의 Gmail 검색 쿼리를 생성
 */
function createAfterYesterdayQuery(): string {
  return `after:${getYesterdayDateString()}`;
}

interface SyncResponse {
	success: boolean;
	data: {
		synced: number;
		skipped: number;
		errors: number;
	};
}

export function useMailSync() {
	const queryClient = useQueryClient();

	return useMutation<SyncResponse>({
		mutationFn: async () => {
			const response = await fetch("/api/mails/sync", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
			body: JSON.stringify({
					maxResults: 100,
					query: createAfterYesterdayQuery(), // 어제 날짜 이후의 메일만 동기화
				}),
			});
			if (!response.ok) {
				throw new Error("Failed to sync mails");
			}
			return response.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["mails"] });
		},
	});
}
