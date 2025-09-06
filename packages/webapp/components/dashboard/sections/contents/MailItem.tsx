"use client";

import type { ReplyMailWithOriginal } from "@finance-operating-automation/core/models";
import {
	ChevronDown,
	ChevronRight,
	Clock,
	Download,
	Paperclip,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { useAttachments } from "@/hooks/useAttachments";
import type { GmailMessage } from "@/types";
import { ReplyMailItem } from "./ReplyMailItem";

interface MailItemProps {
	mail: GmailMessage;
	onClick: () => void;
	replyMails?: ReplyMailWithOriginal[];
}

export function MailItem({ mail, onClick, replyMails = [] }: MailItemProps) {
	const [showAttachments, setShowAttachments] = useState(false);
	const [showReplies, setShowReplies] = useState(false);
	const {
		attachments,
		isLoading: isLoadingAttachments,
		loadAttachments,
		downloadAttachment,
	} = useAttachments();
	const formatDate = (internalDate?: string) => {
		if (!internalDate) return "";

		const date = new Date(parseInt(internalDate, 10));
		const now = new Date();
		const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

		if (diffInHours < 1) {
			return `${Math.floor(diffInHours * 60)}분 전`;
		} else if (diffInHours < 24) {
			return `${Math.floor(diffInHours)}시간 전`;
		} else {
			return date.toLocaleDateString();
		}
	};

	const handleAttachmentClick = async (e: React.MouseEvent) => {
		e.stopPropagation();
		if (!showAttachments && attachments.length === 0) {
			await loadAttachments(mail.message_id);
		}
		setShowAttachments(!showAttachments);
	};

	const handleDownload = (fileName: string) => {
		downloadAttachment(mail.message_id, fileName);
	};

	const handleRepliesToggle = (e: React.MouseEvent) => {
		e.stopPropagation();
		setShowReplies(!showReplies);
	};

	useEffect(() => {
		if (mail.has_attachments && showAttachments && attachments.length === 0) {
			loadAttachments(mail.message_id);
		}
	}, [
		mail.has_attachments,
		showAttachments,
		attachments.length,
		loadAttachments,
		mail.message_id,
	]);

	return (
		<div
			className="flex items-start gap-3 p-3 rounded-lg border bg-white hover:bg-muted/90 cursor-pointer transition-colors"
			onClick={onClick}
			aria-hidden="true"
		>
			<div className="flex-1 min-w-0">
				<div className="flex items-center gap-2 mb-1">
					<p className="text-sm font-medium truncate">{mail.sender}</p>
					{!!mail.is_unread && (
						<div className="w-2 h-2 bg-primary rounded-full" />
					)}
					{replyMails.length > 0 && (
						<button
							type="button"
							onClick={handleRepliesToggle}
							className="flex items-center gap-1 px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full hover:bg-green-200 transition-colors"
							title={`답변 메일 ${showReplies ? "숨기기" : "보기"} (${replyMails.length}개)`}
						>
							{showReplies ? (
								<ChevronDown className="w-3 h-3" />
							) : (
								<ChevronRight className="w-3 h-3" />
							)}
							답변 {replyMails.length}개
						</button>
					)}
					{!!mail.has_attachments && (
						<button
							type="button"
							onClick={handleAttachmentClick}
							className="p-1 hover:bg-muted rounded transition-colors"
							title="첨부파일 보기"
						>
							<Paperclip className="w-3 h-3 text-muted-foreground" />
						</button>
					)}
					<span className="text-xs text-muted-foreground ml-auto flex items-center gap-1">
						<Clock className="w-3 h-3" />
						{formatDate(mail.internal_date)}
					</span>
				</div>
				<p className="text-sm font-medium text-foreground mb-1 truncate">
					{mail.subject || "(제목 없음)"}
				</p>
				<p className="text-xs text-muted-foreground line-clamp-2">
					{mail.snippet || mail.body || "내용 없음"}
				</p>
				<div className="flex items-center gap-2 mt-2">
					<Badge variant="outline" className="text-xs">
						{mail.recipient}
					</Badge>
					{mail.size_estimate && (
						<span className="text-xs text-muted-foreground">
							{Math.round((mail.size_estimate || 0) / 1024)}KB
						</span>
					)}
				</div>
				{showAttachments && mail.has_attachments && (
					<div className="mt-2 p-2 bg-muted/30 rounded border-l-2 border-primary/20">
						<div className="text-xs font-medium text-muted-foreground mb-2">
							첨부파일
						</div>
						{isLoadingAttachments ? (
							<div className="text-xs text-muted-foreground">로딩 중...</div>
						) : (
							<div className="space-y-1">
								{attachments.map((attachment) => (
									<div
										key={attachment.id}
										className="flex items-center justify-between p-1 hover:bg-muted rounded text-xs"
									>
										<span
											className="truncate flex-1"
											title={attachment.file_name}
										>
											{attachment.file_name}
										</span>
										<button
											type="button"
											onClick={(e) => {
												e.stopPropagation();
												handleDownload(attachment.file_name);
											}}
											className="ml-2 p-1 hover:bg-primary/10 rounded transition-colors"
											title={`${attachment.file_name} 다운로드`}
										>
											<Download className="w-3 h-3 text-primary" />
										</button>
									</div>
								))}
							</div>
						)}
					</div>
				)}

				{/* Reply Mails Section */}
				{showReplies && replyMails.length > 0 && (
					<div className="mt-3 pl-4 border-l-2 border-green-200 space-y-2">
						{replyMails.map((replyMail) => (
							<ReplyMailItem key={replyMail.id} replyMail={replyMail} />
						))}
					</div>
				)}
			</div>
		</div>
	);
}
