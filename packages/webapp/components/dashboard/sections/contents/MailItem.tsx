"use client";

import { Clock, Paperclip, User } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {GmailMessage} from "@finance-operating-automation/core/models";

interface MailItemProps {
	mail: GmailMessage;
}

export function MailItem({ mail }: MailItemProps) {
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

	return (
		<div
			className={`flex items-start gap-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors ${
				mail.is_unread ? "border-primary/50 bg-primary/5" : ""
			}`}
		>
			<Avatar className="w-10 h-10">
				<AvatarFallback>
					<User className="w-4 h-4" />
				</AvatarFallback>
			</Avatar>
			<div className="flex-1 min-w-0">
				<div className="flex items-center gap-2 mb-1">
					<p className="text-sm font-medium truncate">
						{mail.sender}
					</p>
					{!!mail.is_unread && (
						<div className="w-2 h-2 bg-primary rounded-full" />
					)}
					{!!mail.has_attachments && (
						<Paperclip className="w-3 h-3 text-muted-foreground" />
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
			</div>
		</div>
	);
}
