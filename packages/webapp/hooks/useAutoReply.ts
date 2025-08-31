import type { EmailLog } from "@finance-operating-automation/core/models";
import { useMutation, useQuery } from "@tanstack/react-query";
import type { AutoReplyLog } from "@/types/dashboard";

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

	// 이메일 로그 가져오기
	const { data: logsData } = useQuery({
		queryKey: ["autoReplyLogs"],
		queryFn: async (): Promise<EmailLog[]> => {
			const response = await fetch("/api/auto-reply?action=logs");
			if (!response.ok) {
				throw new Error("로그 가져오기 실패");
			}
			return (await response.json()).logs as EmailLog[];
		},
		refetchInterval: 5000, // 5초마다 로그 새로고침
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

	// 자동 답변 중지
	const stopMutation = useMutation({
		mutationFn: async () => {
			const response = await fetch("/api/auto-reply", {
				method: "DELETE",
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || "자동 답변을 중지할 수 없습니다.");
			}

			return response.json();
		},
		onSuccess: () => {
			refetchStatus();
		},
	});

	const isAutoReplyRunning = statusData?.isRunning || false;
	const autoReplyLogs: AutoReplyLog[] =
		logsData?.map((log: EmailLog, index: number) => ({
			id: log.id?.toString() ?? `no-id-${index}`,
			subject: log.subject,
			sender: log.sender,
			status: log.status === "success" ? "success" : "error",
			timestamp: log.created_at
				? new Date(log.created_at).toLocaleTimeString("ko-KR")
				: new Date().toLocaleTimeString("ko-KR"),
			message:
				log.status === "success"
					? "자동 답변 전송 완료"
					: log.error_message || "오류 발생",
		})) || [];

	return {
		isAutoReplyRunning,
		autoReplyLogs,
		handleAutoReply: startMutation.mutate,
		handleStopAutoReply: stopMutation.mutate,
		isPending: startMutation.isPending || stopMutation.isPending,
		isSuccess: startMutation.isSuccess,
		isError: startMutation.isError || stopMutation.isError,
		error: startMutation.error || stopMutation.error,
	};
}
