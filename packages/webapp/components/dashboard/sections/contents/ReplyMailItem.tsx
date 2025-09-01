"use client";

import type { ReplyMailWithOriginal } from "@finance-operating-automation/core/models";
import { Paperclip, RefreshCw, Send, User } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useSendReplyMail } from "@/hooks/useReplyMails";
import { useDownloadStaticAttachment } from "@/hooks/useStaticAttachments";
import { parseAttachments } from "@/lib/attachmentUtils";

interface ReplyMailItemProps {
	replyMail: ReplyMailWithOriginal;
}

export function ReplyMailItem({ replyMail }: ReplyMailItemProps) {
	const sendReplyMailMutation = useSendReplyMail();
	const downloadAttachmentMutation = useDownloadStaticAttachment();

	const attachments = replyMail.attachments
		? parseAttachments(replyMail.attachments)
		: [];

	const handleDownloadAttachment = (attachment: string) => {
		if (!attachment) {
			return;
		}

		downloadAttachmentMutation.mutate({
			filename: attachment,
		});
	};

	return (
		<div
			className={`p-3 rounded-lg border transition-colors ${
				!replyMail.is_sent
					? "border-orange-200 bg-orange-50/50"
					: "border-green-200 bg-green-50/50"
			}`}
		>
			<div className="flex items-start gap-3">
				<Avatar className="w-10 h-10">
					<AvatarFallback>
						<User className="w-4 h-4" />
					</AvatarFallback>
				</Avatar>
				<div className="flex-1 min-w-0">
					<div className="flex items-center gap-2 mb-1">
						<p className="text-sm font-medium truncate">
							답장: {replyMail.original_sender}
						</p>
						{attachments.length > 0 && (
							<Paperclip className="w-3 h-3 text-muted-foreground" />
						)}
						<Badge
							variant={replyMail.is_sent ? "default" : "secondary"}
							className="text-xs"
						>
							{replyMail.is_sent ? "전송됨" : "미전송"}
						</Badge>
						<span className="text-xs text-muted-foreground ml-auto">
							{new Date(replyMail.created_at || "").toLocaleDateString()}
						</span>
					</div>
					<p className="text-sm font-medium text-foreground mb-1 truncate">
						{replyMail.subject}
					</p>
					<p className="text-xs text-muted-foreground line-clamp-2 mb-2">
						원본: {replyMail.original_subject}
					</p>
					<p className="text-xs text-muted-foreground line-clamp-3 mb-3 p-2 bg-muted/30 rounded">
						{replyMail.reply_body}
					</p>
					{attachments.length > 0 && (
						<div className="mb-3">
							<div className="flex items-center gap-2 mb-2">
								<Paperclip className="w-3 h-3 text-muted-foreground" />
								<span className="text-xs font-medium text-muted-foreground">
									첨부파일 ({attachments.length}개)
								</span>
							</div>
							<div className="flex flex-wrap gap-1">
								{attachments.map((attachment: string, index: number) => (
									<Badge
										key={attachment || index}
										variant="outline"
										className="text-xs px-2 py-1 cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors"
										onClick={() => handleDownloadAttachment(attachment)}
										title={`${attachment || `첨부파일 ${index + 1}`} 다운로드`}
									>
										{attachment || `첨부파일 ${index + 1}`}
									</Badge>
								))}
							</div>
						</div>
					)}
					<div className="flex items-center gap-2">
						{!replyMail.is_sent && (
							<Button
								size="sm"
								variant="default"
								onClick={() =>
									replyMail.id && sendReplyMailMutation.mutate(replyMail.id)
								}
								disabled={sendReplyMailMutation.isPending}
								className="gap-2"
							>
								{sendReplyMailMutation.isPending ? (
									<RefreshCw className="w-3 h-3 animate-spin" />
								) : (
									<Send className="w-3 h-3" />
								)}
								전송
							</Button>
						)}
						{replyMail.sent_at && (
							<span className="text-xs text-muted-foreground">
								전송일: {new Date(replyMail.sent_at).toLocaleDateString()}
							</span>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
