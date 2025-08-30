"use client";

import type { GmailMessage } from "@finance-operating-automation/core/models";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Clock, Mail, Paperclip, RefreshCw, User } from "lucide-react";
import { useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

interface MailListResponse {
	success: boolean;
	data: GmailMessage[];
}

interface SyncResponse {
	success: boolean;
	data: {
		synced: number;
		skipped: number;
		errors: number;
	};
}

export default function MailList() {
	const [isUnreadOnly, setIsUnreadOnly] = useState(false);
	const queryClient = useQueryClient();

	// 메일 목록 조회
	const {
		data: mailsData,
		isLoading,
		error,
	} = useQuery<MailListResponse>({
		queryKey: ["mails", isUnreadOnly],
		queryFn: async () => {
			const response = await fetch(`/api/mails?unreadOnly=${isUnreadOnly}`);
			if (!response.ok) {
				throw new Error("Failed to fetch mails");
			}
			return response.json();
		},
	});

	// 메일 동기화
	const syncMailsMutation = useMutation<SyncResponse>({
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

	const formatDate = (internalDate?: string) => {
		if (!internalDate) return "";

		const date = new Date(parseInt(internalDate));
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

	const mails = mailsData?.data || [];

	return (
		<Card className="h-[600px]">
			<CardHeader>
				<div className="flex items-center justify-between">
					<div>
						<CardTitle className="flex items-center gap-2">
							<Mail className="w-5 h-5" />
							메일 리스트
						</CardTitle>
						<CardDescription>
							Gmail에서 동기화된 메일 목록을 확인하세요
						</CardDescription>
					</div>
					<div className="flex items-center gap-2">
						<Button
							variant="outline"
							size="sm"
							onClick={() => setIsUnreadOnly(!isUnreadOnly)}
							className={
								isUnreadOnly ? "bg-primary text-primary-foreground" : ""
							}
						>
							{isUnreadOnly ? "전체 보기" : "읽지 않음만"}
						</Button>
						<Button
							onClick={() => syncMailsMutation.mutate()}
							disabled={syncMailsMutation.isPending}
							size="sm"
							className="gap-2"
						>
							<RefreshCw
								className={`w-4 h-4 ${syncMailsMutation.isPending ? "animate-spin" : ""}`}
							/>
							Sync
						</Button>
					</div>
				</div>
			</CardHeader>
			<CardContent>
				{isLoading ? (
					<div className="flex items-center justify-center h-96">
						<RefreshCw className="w-6 h-6 animate-spin" />
						<span className="ml-2">메일 목록을 불러오는 중...</span>
					</div>
				) : error ? (
					<div className="flex items-center justify-center h-96 text-muted-foreground">
						메일 목록을 불러오는데 실패했습니다.
					</div>
				) : mails.length === 0 ? (
					<div className="flex items-center justify-center h-96 text-muted-foreground">
						메일이 없습니다. Sync 버튼을 눌러 메일을 동기화해보세요.
					</div>
				) : (
					<ScrollArea className="h-[480px]">
						<div className="space-y-3">
							{mails.map((mail) => (
								<div
									key={mail.id}
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
											{mail.is_unread && (
												<div className="w-2 h-2 bg-primary rounded-full" />
											)}
											{mail.has_attachments && (
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
							))}
						</div>
					</ScrollArea>
				)}
			</CardContent>
		</Card>
	);
}
