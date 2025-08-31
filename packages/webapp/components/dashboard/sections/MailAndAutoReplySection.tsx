"use client";

import {
	Clock,
	Mail,
	Paperclip,
	Pause,
	Play,
	RefreshCw,
	Send,
	Settings,
	User,
} from "lucide-react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMailSync } from "@/hooks/useMailSync";
import { useMails } from "@/hooks/useMails";
import {
	useGenerateReplies,
	useReplyMails,
	useSendReplyMail,
} from "@/hooks/useReplyMails";
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
	const [isUnsentOnly, setIsUnsentOnly] = useState(true);

	// 메일 목록 조회
	const { data: mailsData, isLoading, error } = useMails(isUnreadOnly);

	// 답변 메일 목록 조회
	const {
		data: replyMailsData,
		isLoading: isReplyMailsLoading,
		error: replyMailsError,
	} = useReplyMails(isUnsentOnly);

	// 메일 동기화
	const syncMailsMutation = useMailSync();

	// 답변 생성
	const generateRepliesMutation = useGenerateReplies();

	// 답변 메일 전송
	const sendReplyMailMutation = useSendReplyMail();

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
							메일 리스트 & AI 답변 관리
						</CardTitle>
						<CardDescription>
							Gmail 메일 목록과 AI 답변 생성/전송 기능을 관리하세요
						</CardDescription>
					</div>
					<div className="flex items-center gap-2">
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
				{/* AI Reply Generation Control Section */}
				<div className="p-4 bg-muted/20 rounded-lg space-y-4">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-4">
							<div className="text-sm">
								<span className="font-medium">답변 생성 상태: </span>
								<Badge
									variant={
										generateRepliesMutation.isPending
											? "secondary"
											: generateRepliesMutation.isError
												? "destructive"
												: generateRepliesMutation.isSuccess
													? "outline"
													: "secondary"
									}
								>
									{generateRepliesMutation.isPending
										? "생성 중..."
										: generateRepliesMutation.isError
											? "오류"
											: generateRepliesMutation.isSuccess
												? "완료"
												: "대기"}
								</Badge>
							</div>
							{generateRepliesMutation.isError &&
								generateRepliesMutation.error && (
									<div className="text-sm text-destructive">
										{generateRepliesMutation.error.message}
									</div>
								)}
						</div>
						<div className="flex items-center gap-2">
							<Button
								onClick={() => generateRepliesMutation.mutate()}
								className="gap-2"
								size="sm"
								disabled={generateRepliesMutation.isPending}
							>
								{generateRepliesMutation.isPending ? (
									<RefreshCw className="w-4 h-4 animate-spin" />
								) : (
									<Play className="w-4 h-4" />
								)}
								{generateRepliesMutation.isPending ? "생성 중..." : "답변 생성"}
							</Button>
							<Button variant="outline" size="sm">
								<Settings className="w-4 h-4" />
							</Button>
						</div>
					</div>
				</div>

				{/* Tabs for Mail List and Reply Mails */}
				<Tabs defaultValue="mails" className="flex-1">
					<TabsList className="grid w-full grid-cols-2">
						<TabsTrigger value="mails">받은 메일</TabsTrigger>
						<TabsTrigger value="replies">답변 메일</TabsTrigger>
					</TabsList>

					<TabsContent value="mails" className="mt-4">
						<div className="flex items-center justify-between mb-3">
							<h4 className="text-sm font-medium">메일 목록</h4>
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
						</div>
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
							<div className="h-[400px] overflow-auto">
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
							</div>
						)}
					</TabsContent>

					<TabsContent value="replies" className="mt-4">
						<div className="flex items-center justify-between mb-3">
							<h4 className="text-sm font-medium">답변 메일</h4>
							<Button
								variant="outline"
								size="sm"
								onClick={() => setIsUnsentOnly(!isUnsentOnly)}
								className={
									isUnsentOnly ? "bg-primary text-primary-foreground" : ""
								}
							>
								{isUnsentOnly ? "전체 보기" : "미전송만"}
							</Button>
						</div>
						{isReplyMailsLoading ? (
							<div className="flex items-center justify-center h-96">
								<RefreshCw className="w-6 h-6 animate-spin" />
								<span className="ml-2">답변 메일을 불러오는 중...</span>
							</div>
						) : replyMailsError ? (
							<div className="flex items-center justify-center h-96 text-muted-foreground">
								답변 메일 목록을 불러오는데 실패했습니다.
							</div>
						) : !replyMailsData?.data || replyMailsData.data.length === 0 ? (
							<div className="flex items-center justify-center h-96 text-muted-foreground">
								답변 메일이 없습니다. '답변 생성' 버튼을 눌러 답변을
								생성해보세요.
							</div>
						) : (
							<ScrollArea className="h-[400px]">
								<div className="space-y-2">
									{replyMailsData.data.map((replyMail) => (
										<div
											key={replyMail.id}
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
														{replyMail.attachments &&
															JSON.parse(replyMail.attachments).length > 0 && (
																<Paperclip className="w-3 h-3 text-muted-foreground" />
															)}
														<Badge
															variant={
																replyMail.is_sent ? "default" : "secondary"
															}
															className="text-xs"
														>
															{replyMail.is_sent ? "전송됨" : "미전송"}
														</Badge>
														<span className="text-xs text-muted-foreground ml-auto">
															{new Date(
																replyMail.created_at || "",
															).toLocaleDateString()}
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
													{replyMail.attachments &&
														JSON.parse(replyMail.attachments).length > 0 && (
															<div className="mb-3">
																<div className="flex items-center gap-2 mb-2">
																	<Paperclip className="w-3 h-3 text-muted-foreground" />
																	<span className="text-xs font-medium text-muted-foreground">
																		첨부파일 (
																		{JSON.parse(replyMail.attachments).length}
																		개)
																	</span>
																</div>
																<div className="flex flex-wrap gap-1">
																	{JSON.parse(replyMail.attachments).map(
																		(attachment: any, index: number) => (
																			<Badge
																				key={index}
																				variant="outline"
																				className="text-xs px-2 py-1"
																			>
																				{attachment.filename ||
																					`첨부파일 ${index + 1}`}
																				{attachment.size && (
																					<span className="ml-1 text-muted-foreground">
																						(
																						{Math.round(attachment.size / 1024)}
																						KB)
																					</span>
																				)}
																			</Badge>
																		),
																	)}
																</div>
															</div>
														)}
													<div className="flex items-center gap-2">
														{!replyMail.is_sent && (
															<Button
																size="sm"
																variant="default"
																onClick={() =>
																	replyMail.id &&
																	sendReplyMailMutation.mutate(replyMail.id)
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
																전송일:{" "}
																{new Date(
																	replyMail.sent_at,
																).toLocaleDateString()}
															</span>
														)}
													</div>
												</div>
											</div>
										</div>
									))}
								</div>
							</ScrollArea>
						)}
					</TabsContent>
				</Tabs>
			</CardContent>
		</Card>
	);
}
