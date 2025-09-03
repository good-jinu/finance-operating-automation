import { Bot, User } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

// This structure should be consistent with the one in useChat.ts and the store.
interface Message {
	sender: "user" | "ai";
	content: string;
	id: string;
}

export default function MessageList({ messages }: { messages: Message[] }) {
	if (messages.length === 0) {
		return (
			<div className="flex h-full items-center justify-center">
				<div className="text-center">
					<Bot className="mx-auto h-12 w-12 text-muted-foreground" />
					<h3 className="mt-4 text-lg font-medium">대화를 시작해보세요</h3>
					<p className="mt-1 text-sm text-muted-foreground">
						무엇이든 물어보세요. 예: "오늘 온 메일 처리해줘"
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-4">
			{messages.map((message) => (
				<div
					key={message.id}
					className={cn(
						"flex items-start gap-3",
						message.sender === "user" ? "justify-end" : "justify-start",
					)}
				>
					{message.sender === "ai" && (
						<Avatar className="h-8 w-8">
							<AvatarFallback>
								<Bot className="h-5 w-5" />
							</AvatarFallback>
						</Avatar>
					)}
					<Card
						className={cn(
							"max-w-md p-3 shadow-sm",
							message.sender === "user"
								? "bg-primary text-primary-foreground"
								: "bg-muted",
						)}
					>
						<CardContent className="p-0 text-sm">{message.content}</CardContent>
					</Card>
					{message.sender === "user" && (
						<Avatar className="h-8 w-8">
							<AvatarFallback>
								<User className="h-5 w-5" />
							</AvatarFallback>
						</Avatar>
					)}
				</div>
			))}
		</div>
	);
}
