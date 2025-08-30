import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Email } from "@/types/dashboard";

interface RecentActivitySectionProps {
	recentEmails: Email[];
}

export default function RecentActivitySection({
	recentEmails,
}: RecentActivitySectionProps) {
	return (
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
	);
}
