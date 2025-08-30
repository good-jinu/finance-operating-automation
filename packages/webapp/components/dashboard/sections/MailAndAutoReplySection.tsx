"use client";

import { Clock, Mail, Paperclip, Pause, Play, RefreshCw, Settings, User } from "lucide-react";
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
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useMails } from "@/hooks/useMails";
import { useMailSync } from "@/hooks/useMailSync";
import type { AutoReplyLog } from "@/types/dashboard";

interface MailAndAutoReplySectionProps {
	isAutoReplyRunning: boolean;
	autoReplyLogs: AutoReplyLog[];
	onStartAutoReply: () => void;
	onStopAutoReply: () => void;
	isPending?: boolean;
	isSuccess?: boolean;
	isError?: boolean;
	error?: Error | null;
}

export default function MailAndAutoReplySection({
	isAutoReplyRunning,
	autoReplyLogs,
	onStartAutoReply,
	onStopAutoReply,
	isPending = false,
	isSuccess = false,
	isError = false,
}: MailAndAutoReplySectionProps) {
	const [isUnreadOnly, setIsUnreadOnly] = useState(false);

	// 메일 목록 조회
	const {
		data: mailsData,
		isLoading,
		error,
	} = useMails(isUnreadOnly);

	// 메일 동기화
	const syncMailsMutation = useMailSync();

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

	const mails = mailsData?.data || [];

	return (
		<Card className="h-[700px]">
			<CardHeader>
				<div className="flex items-center justify-between">
					<div>
						<CardTitle className="flex items-center gap-2">
							<Mail className="w-5 h-5" />
							메일 리스트 & AI 자동 답변
						</CardTitle>
						<CardDescription>
							Gmail 메일 목록과 AI 자동 답변 기능을 한번에 관리하세요
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
							variant="outline"
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
			<CardContent className="space-y-4">
				{/* AI Auto Reply Control Section */}
				<div className="p-4 bg-muted/20 rounded-lg space-y-4">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-4">
							<div className="text-sm">
								<span className="font-medium">자동 답변 상태: </span>
								<Badge 
									variant={
										isAutoReplyRunning 
											? "default" 
											: isPending 
											? "secondary"
											: isError 
											? "destructive"
											: isSuccess
											? "outline"
											: "secondary"
									}
								>
									{isPending ? "시작 중..." : isAutoReplyRunning ? "실행 중" : isError ? "오류" : isSuccess ? "완료" : "대기"}
								</Badge>
							</div>
							{isError && error && (
								<div className="text-sm text-destructive">
									{error.message}
								</div>
							)}
						</div>
						<div className="flex items-center gap-2">
							{!isAutoReplyRunning ? (
								<Button 
									onClick={onStartAutoReply} 
									className="gap-2" 
									size="sm"
									disabled={isPending}
								>
									{isPending ? (
										<RefreshCw className="w-4 h-4 animate-spin" />
									) : (
										<Play className="w-4 h-4" />
									)}
									{isPending ? "시작 중..." : "자동 답변 시작"}
								</Button>
							) : (
								<Button
									onClick={onStopAutoReply}
									variant="outline"
									className="gap-2"
									size="sm"
									disabled={isPending}
								>
									<Pause className="w-4 h-4" />
									중지
								</Button>
							)}
							<Button variant="outline" size="sm">
								<Settings className="w-4 h-4" />
							</Button>
						</div>
					</div>

					{autoReplyLogs.length > 0 && (
						<div>
							<h4 className="text-sm font-medium mb-2">처리 로그</h4>
							<ScrollArea className="h-24 border rounded-lg p-2">
								<div className="space-y-2">
									{autoReplyLogs.slice(0, 3).map((log) => (
										<div
											key={log.id}
											className="flex items-center justify-between text-xs p-2 rounded bg-muted/50"
										>
											<div className="flex items-center gap-2">
												<div
													className={`w-2 h-2 rounded-full ${
														log.status === "success"
															? "bg-green-500"
															: log.status === "error"
																? "bg-red-500"
																: "bg-yellow-500"
													}`}
												/>
												<span className="truncate max-w-32">{log.subject}</span>
											</div>
											<div className="flex items-center gap-2">
												<span className="text-muted-foreground">
													{log.timestamp}
												</span>
												<Badge
													variant={
														log.status === "success" ? "default" : "destructive"
													}
													className="text-xs"
												>
													{log.status === "success" ? "완료" : "오류"}
												</Badge>
											</div>
										</div>
									))}
								</div>
							</ScrollArea>
						</div>
					)}
				</div>

				{/* Mail List Section */}
				<div className="flex-1">
					<h4 className="text-sm font-medium mb-3">메일 목록</h4>
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
						<ScrollArea className="h-[400px]">
							<div className="space-y-2">
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
								))}
							</div>
						</ScrollArea>
					)}
				</div>
			</CardContent>
		</Card>
	);
}
