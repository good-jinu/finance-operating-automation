"use client";

import type {
	GmailMessage as Mail,
	ReplyMailWithOriginal,
} from "@finance-operating-automation/core/models";
import { Loader2, Send, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import Markdown from "react-markdown";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { useGenerateReplies, useReplyMails } from "@/hooks/useReplyMails";
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
	const { data: replyMailsData, isLoading: isLoadingReplies } = useReplyMails(
		false,
		mail.message_id,
	);
	const generateRepliesMutation = useGenerateReplies();

	const existingReplies = replyMailsData?.data || [];

	const handleGenerateReply = () => {
		if (mail.id) {
			generateRepliesMutation.mutate({ mailIds: mail.id });
		}
	};

	return (
		<Dialog open={open} onOpenChange={onClose}>
			<DialogContent className="max-w-4xl h-[90vh] flex flex-col">
				<DialogHeader>
					<DialogTitle className="truncate">{mail.subject}</DialogTitle>
				</DialogHeader>
				<div className="flex-1 overflow-hidden grid grid-cols-2 gap-4">
					{/* Original Mail Section */}
					<div className="flex flex-col gap-2 h-full">
						<div className="text-sm text-muted-foreground">
							<p>
								<strong>From:</strong> {mail.sender}
							</p>
							<p>
								<strong>To:</strong> {mail.recipient}
							</p>
							<p>
								<strong>Date:</strong>{" "}
								{new Date(parseInt(mail.internal_date || "0")).toLocaleString()}
							</p>
						</div>
						<div className="flex-1 border rounded-md overflow-auto">
							<div className="w-full h-full border-0 p-3">
								<Markdown>{mail.body}</Markdown>
							</div>
						</div>
					</div>

					{/* Reply Section */}
					<div className="overflow-auto h-full">
						<div className="flex flex-col space-y-4 pr-2">
							<div className="flex justify-between items-center">
								<h3 className="text-lg font-semibold">답변 관리</h3>
								<Button
									onClick={handleGenerateReply}
									disabled={generateRepliesMutation.isPending}
									size="sm"
									variant="outline"
									className="gap-2"
								>
									{generateRepliesMutation.isPending ? (
										<Loader2 className="w-4 h-4 animate-spin" />
									) : (
										<Sparkles className="w-4 h-4" />
									)}
									AI 답변 생성
								</Button>
							</div>

							{/* Existing Replies */}
							<div className="space-y-2 flex-1 overflow-auto">
								{isLoadingReplies ? (
									<p>답변 목록 로딩 중...</p>
								) : existingReplies.length > 0 ? (
									<div className="space-y-2">
										{existingReplies.map((reply) => (
											<ReplyMailItem key={reply.id} replyMail={reply} />
										))}
									</div>
								) : (
									<p className="text-sm text-muted-foreground">
										생성된 답변이 없습니다.
									</p>
								)}
							</div>
						</div>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
