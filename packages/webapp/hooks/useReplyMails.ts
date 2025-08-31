import type { ReplyMailWithOriginal } from "@finance-operating-automation/core/models";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

interface ReplyMailListResponse {
	success: boolean;
	data: ReplyMailWithOriginal[];
	total: number;
}

interface GenerateRepliesResponse {
	success: boolean;
	data: {
		totalEmails: number;
		processedEmails: number;
		successCount: number;
		errorCount: number;
		status: "running" | "completed" | "error";
	};
}

interface SendReplyMailResponse {
	success: boolean;
	data: { sent: boolean };
}

export function useReplyMails(unsentOnly: boolean = false) {
	return useQuery<ReplyMailListResponse>({
		queryKey: ["reply-mails", unsentOnly],
		queryFn: async () => {
			const response = await fetch(`/api/reply-mails?unsentOnly=${unsentOnly}`);
			if (!response.ok) {
				throw new Error("Failed to fetch reply mails");
			}
			return response.json();
		},
	});
}

export function useGenerateReplies() {
	const queryClient = useQueryClient();

	return useMutation<GenerateRepliesResponse>({
		mutationFn: async () => {
			const response = await fetch("/api/reply-mails/generate", {
				method: "POST",
			});
			if (!response.ok) {
				throw new Error("Failed to generate replies");
			}
			return response.json();
		},
		onSuccess: () => {
			// 답변 메일 목록 새로고침
			queryClient.invalidateQueries({ queryKey: ["reply-mails"] });
		},
	});
}

export function useSendReplyMail() {
	const queryClient = useQueryClient();

	return useMutation<SendReplyMailResponse, Error, number>({
		mutationFn: async (replyMailId: number) => {
			const response = await fetch("/api/reply-mails/send", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ replyMailId }),
			});
			if (!response.ok) {
				throw new Error("Failed to send reply mail");
			}
			return response.json();
		},
		onSuccess: () => {
			// 답변 메일 목록 새로고침
			queryClient.invalidateQueries({ queryKey: ["reply-mails"] });
		},
	});
}
