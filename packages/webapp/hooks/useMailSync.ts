import { useMutation, useQueryClient } from "@tanstack/react-query";

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
					query: "",
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
