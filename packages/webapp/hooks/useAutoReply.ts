import { useMutation, useQuery } from "@tanstack/react-query";

export function useAutoReply() {
	// 자동 답변 상태 확인
	const { data: statusData, refetch: refetchStatus } = useQuery({
		queryKey: ["autoReplyStatus"],
		queryFn: async () => {
			const response = await fetch("/api/auto-reply?action=status");
			if (!response.ok) {
				throw new Error("상태 확인 실패");
			}
			return response.json();
		},
		refetchInterval: 3000, // 3초마다 상태 확인
	});

	// 자동 답변 시작
	const startMutation = useMutation({
		mutationFn: async () => {
			const response = await fetch("/api/auto-reply", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || "자동 답변을 시작할 수 없습니다.");
			}

			return response.json();
		},
		onSuccess: () => {
			refetchStatus();
		},
	});

	const isAutoReplyRunning = statusData?.isRunning || false;

	return {
		isAutoReplyRunning,
		handleAutoReply: startMutation.mutate,
	};
}
