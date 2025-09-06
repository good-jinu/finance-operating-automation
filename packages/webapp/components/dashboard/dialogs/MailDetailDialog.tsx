"use client";

import { useEffect, useState } from "react";
import type { GmailMessage as Mail } from "@finance-operating-automation/core/models";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, Sparkles } from "lucide-react";
import Markdown from "react-markdown";
import { socket } from "@/lib/socket";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { useReplyMails } from "@/hooks/useReplyMails";
import { ReplyMailItem } from "../sections/contents/ReplyMailItem";

interface MailDetailDialogProps {
	mail: Mail;
	open: boolean;
	onClose: () => void;
}

export function MailDetailDialog({
	mail,
	open,
	onClose,
}: MailDetailDialogProps) {
	const queryClient = useQueryClient();
	const {
		data: replyMailsData,
		isLoading: isLoadingReplies,
		refetch: refetchReplies,
	} = useReplyMails(false, mail.message_id);

	const [isGenerating, setIsGenerating] = useState(false);
	const [agentStatus, setAgentStatus] = useState<string | null>(null);

	const existingReplies = replyMailsData?.data || [];

	useEffect(() => {
		if (!open) return;

		const handleAgentStatus = (data: { message: string }) => {
			setAgentStatus(data.message);
		};

		const handleGenerationComplete = () => {
			setIsGenerating(false);
			setAgentStatus("답변 생성이 완료되었습니다.");
			setTimeout(() => {
				refetchReplies();
				setAgentStatus(null);
			}, 2000);
		};

		const handleGenerationError = (error: { message: string }) => {
			setIsGenerating(false);
			setAgentStatus(`오류: ${error.message}`);
		};

		socket.on("agent-status", handleAgentStatus);
		socket.on("generation-complete", handleGenerationComplete);
		socket.on("generation-error", handleGenerationError);

		return () => {
			socket.off("agent-status", handleAgentStatus);
			socket.off("generation-complete", handleGenerationComplete);
			socket.off("generation-error", handleGenerationError);
		};
	}, [open, refetchReplies]);

	const handleGenerateReply = () => {
		if (mail.id) {
			setIsGenerating(true);
			setAgentStatus("AI 답변 생성을 시작합니다...");
			socket.emit("generate-reply", { mailId: mail.id });
		}
	};

	return (
		<Dialog open={open} onOpenChange={onClose}>
			<DialogContent className="max-w-4xl h-[90vh] flex flex-col">
				{/* Fixed Header Section */}
				<div className="flex-shrink-0 border-b pb-4">
					<div className="grid grid-cols-2 items-end">
						<div className="flex-1 pr-4">
							<DialogHeader className="p-0 mb-2">
								<DialogTitle className="truncate">{mail.subject}</DialogTitle>
							</DialogHeader>
							<div className="text-sm text-muted-foreground space-y-1">
								<p>
									<strong>From:</strong> {mail.sender}
								</p>
								<p>
									<strong>To:</strong> {mail.recipient}
								</p>
								<p>
									<strong>Date:</strong>{" "}
									{new Date(
										parseInt(mail.internal_date || "0"),
									).toLocaleString()}
								</p>
							</div>
						</div>
						<div className="flex items-center gap-2 flex-shrink-0 justify-self-end">
							<Button
								onClick={handleGenerateReply}
								disabled={isGenerating}
								size="sm"
								variant="outline"
								className="gap-2"
							>
								{isGenerating ? (
									<Loader2 className="w-4 h-4 animate-spin" />
								) : (
									<Sparkles className="w-4 h-4" />
								)}
								AI 답변 생성
							</Button>
						</div>
					</div>
				</div>

				{/* Scrollable Body Section */}
				<div className="flex-1 grid md:grid-cols-2 gap-4 overflow-hidden pt-4">
					{/* Original Mail Content */}
					<div className="flex flex-col h-full overflow-hidden">
						<h3 className="text-lg font-semibold mb-2 flex-shrink-0">
							메일 내용
						</h3>
						<div className="flex-1 border rounded-md overflow-auto p-3">
							<Markdown>{mail.body}</Markdown>
						</div>
					</div>

					{/* Reply Mail List */}
					<div className="flex flex-col h-full overflow-hidden">
						<h3 className="text-lg font-semibold mb-2 flex-shrink-0">
							답변 메일 리스트
						</h3>
						<div className="flex-1 overflow-auto pr-2">
							{isGenerating && agentStatus && (
								<div className="p-3 mb-4 border rounded-lg bg-muted text-sm text-muted-foreground">
									<div className="flex items-center gap-2">
										<Sparkles className="w-4 h-4 text-primary" />
										<p className="flex-1">{agentStatus}</p>
									</div>
								</div>
							)}
							{isLoadingReplies ? (
								<p>답변 목록 로딩 중...</p>
							) : existingReplies.length > 0 ? (
								<div className="space-y-2">
									{existingReplies.map((reply) => (
										<ReplyMailItem key={reply.id} replyMail={reply} />
									))}
								</div>
							) : !isGenerating ? (
								<p className="text-sm text-muted-foreground">
									생성된 답변이 없습니다.
								</p>
							) : null}
						</div>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
