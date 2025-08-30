import { Mail, Pause, Play, Settings } from "lucide-react";
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
import type { AutoReplyLog, Email, FinOpsStats } from "@/types/dashboard";
import MailList from "../MailList";

interface DashboardTabProps {
	stats: FinOpsStats;
	recentEmails: Email[];
	isAutoReplyRunning: boolean;
	autoReplyProgress: number;
	processedEmails: number;
	totalUnreadEmails: number;
	autoReplyLogs: AutoReplyLog[];
	onStartAutoReply: () => void;
	onStopAutoReply: () => void;
}

export default function DashboardTab({
	recentEmails,
	isAutoReplyRunning,
	autoReplyProgress,
	processedEmails,
	totalUnreadEmails,
	autoReplyLogs,
	onStartAutoReply,
	onStopAutoReply,
}: DashboardTabProps) {
	return (
		<div className="space-y-6">
			<MailList />

			{/* AI Auto Reply Control */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Mail className="w-5 h-5" />
						읽지 않은 메일 자동 답변
					</CardTitle>
					<CardDescription>
						AI가 읽지 않은 메일들을 자동으로 분석하고 답변합니다
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-4">
							<div className="text-sm">
								<span className="font-medium">처리 진행률: </span>
								<span>
									{processedEmails}/{totalUnreadEmails}
								</span>
							</div>
							{isAutoReplyRunning && (
								<div className="flex items-center gap-2">
									<Progress value={autoReplyProgress} className="w-32" />
									<span className="text-sm text-muted-foreground">
										{Math.round(autoReplyProgress)}%
									</span>
								</div>
							)}
						</div>
						<div className="flex items-center gap-2">
							{!isAutoReplyRunning ? (
								<Button onClick={onStartAutoReply} className="gap-2">
									<Play className="w-4 h-4" />
									자동 답변 시작
								</Button>
							) : (
								<Button
									onClick={onStopAutoReply}
									variant="outline"
									className="gap-2"
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
							<ScrollArea className="h-32 border rounded-lg p-2">
								<div className="space-y-2">
									{autoReplyLogs.slice(0, 5).map((log) => (
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
				</CardContent>
			</Card>

			{/* Recent Activity */}
			<Card>
				<CardHeader>
					<CardTitle>최근 처리 내역</CardTitle>
					<CardDescription>AI가 최근에 처리한 금융 업무들</CardDescription>
				</CardHeader>
				<CardContent>
					<ScrollArea className="h-64">
						<div className="space-y-3">
							{recentEmails.map((email) => (
								<div
									key={email.id}
									className="flex items-start gap-3 p-3 rounded-lg border"
								>
									<Avatar className="w-8 h-8">
										<AvatarFallback>
											{email.sender.split(" ")[0][0]}
										</AvatarFallback>
									</Avatar>
									<div className="flex-1 min-w-0">
										<div className="flex items-center gap-2 mb-1">
											<p className="text-sm font-medium truncate">
												{email.sender}
											</p>
											<Badge
												variant={email.isAI ? "default" : "secondary"}
												className="text-xs"
											>
												{email.category}
											</Badge>
											<span className="text-xs text-muted-foreground ml-auto">
												{email.time}
											</span>
										</div>
										<p className="text-sm text-foreground mb-1">
											{email.subject}
										</p>
										<p className="text-xs text-muted-foreground">
											{email.preview}
										</p>
									</div>
								</div>
							))}
						</div>
					</ScrollArea>
				</CardContent>
			</Card>
		</div>
	);
}
