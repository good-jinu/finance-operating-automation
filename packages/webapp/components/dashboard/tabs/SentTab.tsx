import { Bot, MessageSquare, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Email } from "@/types/dashboard";

interface SentTabProps {
	recentEmails: Email[];
}

export default function SentTab({ recentEmails }: SentTabProps) {
	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h2 className="text-2xl font-bold">처리 완료 내역</h2>
				<Button>
					<Plus className="w-4 h-4 mr-2" />
					수동 처리
				</Button>
			</div>

			<Card>
				<CardContent className="p-0">
					<ScrollArea className="h-96">
						{recentEmails
							.filter((email) => email.isAI)
							.map((email) => (
								<div
									key={email.id}
									className="flex items-center gap-4 p-4 border-b hover:bg-muted/50 cursor-pointer"
								>
									<div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
										<Bot className="w-4 h-4 text-primary-foreground" />
									</div>
									<div className="flex-1 min-w-0">
										<div className="flex items-center gap-2 mb-1">
											<p className="font-medium">AI 어시스턴트</p>
											<Badge>AI가 보냄</Badge>
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
											<MessageSquare className="w-4 h-4" />
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
