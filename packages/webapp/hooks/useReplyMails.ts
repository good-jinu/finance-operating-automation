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

interface UpdateReplyMailResponse {
	success: boolean;
	data: { updated: boolean };
}

interface DeleteReplyMailResponse {
	success: boolean;
	data: { deleted: boolean };
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

	return useMutation<GenerateRepliesResponse, Error, { mailIds: number[] }>({
		mutationFn: async ({ mailIds }) => {
			const response = await fetch("/api/reply-mails/generate", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ mailIds }),
			});
			if (!response.ok) {
				const errorData = await response
					.json()
					.catch(() => ({ message: "Failed to generate replies" }));
				throw new Error(errorData.message || "Failed to generate replies");
			}
			return response.json();
		},
		onSuccess: () => {
			// 답변 메일 목록 새로고침
			queryClient.invalidateQueries({ queryKey: ["reply-mails"] });
			// 원본 메일 목록도 새로고침하여 '답변 생성됨' 상태 등을 업데이트 할 수 있도록 함
			queryClient.invalidateQueries({ queryKey: ["mails"] });
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

export function useUpdateReplyMail() {
	const queryClient = useQueryClient();

	return useMutation<
		UpdateReplyMailResponse,
		Error,
		{ id: number; subject: string; reply_body: string }
	>({
		mutationFn: async ({ id, subject, reply_body }) => {
			const response = await fetch("/api/reply-mails/update", {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ id, subject, reply_body }),
			});
			if (!response.ok) {
				const errorData = await response
					.json()
					.catch(() => ({ error: "Failed to update reply mail" }));
				throw new Error(errorData.error || "Failed to update reply mail");
			}
			return response.json();
		},
		onSuccess: () => {
			// 답변 메일 목록 새로고침
			queryClient.invalidateQueries({ queryKey: ["reply-mails"] });
		},
	});
}

export function useDeleteReplyMail() {
	const queryClient = useQueryClient();

	return useMutation<DeleteReplyMailResponse, Error, number>({
		mutationFn: async (id: number) => {
			const response = await fetch("/api/reply-mails/delete", {
				method: "DELETE",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ id }),
			});
			if (!response.ok) {
				const errorData = await response
					.json()
					.catch(() => ({ error: "Failed to delete reply mail" }));
				throw new Error(errorData.error || "Failed to delete reply mail");
			}
			return response.json();
		},
		onSuccess: () => {
			// 답변 메일 목록 새로고침
			queryClient.invalidateQueries({ queryKey: ["reply-mails"] });
		},
	});
}
