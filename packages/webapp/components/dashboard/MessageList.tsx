import { Bot, Loader2, User } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useChatStore } from "@/store/chat";

// This structure should be consistent with the one in useChat.ts and the store.
interface Message {
	sender: "user" | "ai";
	content: string;
	id: string;
}

export default function MessageList({ messages }: { messages: Message[] }) {
	const { isStreaming } = useChatStore();
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
								{/* 마지막 AI 메시지이고 스트리밍 중이라면 로더 표시 */}
								{isStreaming &&
								messages[messages.length - 1]?.id === message.id ? (
									<Loader2 className="h-5 w-5 animate-spin" />
								) : (
									<Bot className="h-5 w-5" />
								)}
							</AvatarFallback>
						</Avatar>
					)}
					<Card
						className={cn(
							"max-w-md p-3 shadow-sm",
							message.sender === "user"
								? "bg-primary text-primary-foreground"
								: "bg-muted",
							/* 스트리밍 중이면 약간의 기다림 효과 */
							isStreaming &&
								message.sender === "ai" &&
								messages[messages.length - 1]?.id === message.id
								? "animate-pulse"
								: "",
						)}
					>
						<CardContent className="p-0 text-sm whitespace-pre-wrap">
							{message.content}
							{/* 스트리밍 중이고 마지막 AI 메시지라면 커서 표시 */}
							{isStreaming &&
								message.sender === "ai" &&
								messages[messages.length - 1]?.id === message.id && (
									<span className="inline-block w-2 h-5 ml-1 bg-current animate-pulse" />
								)}
						</CardContent>
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
