import {
	AlertCircle,
	Archive,
	Bot,
	CheckCircle,
	Filter,
	Search,
	Star,
	Users,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Email } from "@/types/dashboard";

interface InboxTabProps {
	recentEmails: Email[];
	isAutoReplyRunning: boolean;
	processedEmails: number;
	totalUnreadEmails: number;
}

export default function InboxTab({
	recentEmails,
	isAutoReplyRunning,
	processedEmails,
	totalUnreadEmails,
}: InboxTabProps) {
	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h2 className="text-2xl font-bold">고객 요청 현황</h2>
				<div className="flex items-center gap-2">
					<Button variant="outline" size="sm">
						<Filter className="w-4 h-4 mr-2" />
						필터
					</Button>
					<div className="relative">
						<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
						<Input placeholder="메일 검색..." className="pl-10 w-64" />
					</div>
				</div>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
				<Card className="cursor-pointer hover:shadow-md transition-shadow">
					<CardContent className="p-4">
						<div className="flex items-center gap-3">
							<div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
								<Bot className="w-5 h-5 text-purple-600" />
							</div>
							<div>
								<p className="font-medium">자동 처리 중</p>
								<p className="text-sm text-muted-foreground">
									{isAutoReplyRunning
										? `${processedEmails}/${totalUnreadEmails}`
										: "대기"}
								</p>
							</div>
						</div>
					</CardContent>
				</Card>
				<Card className="cursor-pointer hover:shadow-md transition-shadow">
					<CardContent className="p-4">
						<div className="flex items-center gap-3">
							<div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
								<AlertCircle className="w-5 h-5 text-red-600" />
							</div>
							<div>
								<p className="font-medium">긴급 처리</p>
								<p className="text-sm text-muted-foreground">8개</p>
							</div>
						</div>
					</CardContent>
				</Card>
				<Card className="cursor-pointer hover:shadow-md transition-shadow">
					<CardContent className="p-4">
						<div className="flex items-center gap-3">
							<div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
								<Users className="w-5 h-5 text-blue-600" />
							</div>
							<div>
								<p className="font-medium">수권자 변경</p>
								<p className="text-sm text-muted-foreground">23개</p>
							</div>
						</div>
					</CardContent>
				</Card>
				<Card className="cursor-pointer hover:shadow-md transition-shadow">
					<CardContent className="p-4">
						<div className="flex items-center gap-3">
							<div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
								<CheckCircle className="w-5 h-5 text-green-600" />
							</div>
							<div>
								<p className="font-medium">자동 승인</p>
								<p className="text-sm text-muted-foreground">89개</p>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>

			<Card>
				<CardContent className="p-0">
					<ScrollArea className="h-96">
						{recentEmails.map((email) => (
							<div
								key={email.id}
								className="flex items-center gap-4 p-4 border-b hover:bg-muted/50 cursor-pointer"
							>
								<Avatar>
									<AvatarFallback>{email.sender[0]}</AvatarFallback>
								</Avatar>
								<div className="flex-1 min-w-0">
									<div className="flex items-center gap-2 mb-1">
										<p className="font-medium">{email.sender}</p>
										<Badge variant={email.isAI ? "default" : "secondary"}>
											{email.category}
										</Badge>
									</div>
									<p className="text-sm text-foreground mb-1">
										{email.subject}
									</p>
									<p className="text-xs text-muted-foreground">
										{email.preview}
									</p>
								</div>
								<div className="flex items-center gap-2">
									<span className="text-xs text-muted-foreground">
										{email.time}
									</span>
									<Button variant="ghost" size="sm">
										<Star className="w-4 h-4" />
									</Button>
									<Button variant="ghost" size="sm">
										<Archive className="w-4 h-4" />
									</Button>
								</div>
							</div>
						))}
					</ScrollArea>
				</CardContent>
			</Card>
		</div>
	);
}
