import { Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useChatStore } from "@/store/chat";

interface MessageInputProps {
	input: string;
	handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
	handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

export default function MessageInput({
	input,
	handleInputChange,
	handleSubmit,
}: MessageInputProps) {
	const { isStreaming } = useChatStore();
	return (
		<form onSubmit={handleSubmit} className="flex items-center gap-2">
			<Input
				value={input}
				onChange={handleInputChange}
				placeholder={
					isStreaming ? "AI가 응답 중입니다..." : "메시지를 입력하세요..."
				}
				className="flex-1"
				disabled={isStreaming}
			/>
			<Button type="submit" size="icon" disabled={isStreaming || !input.trim()}>
				{isStreaming ? (
					<Loader2 className="h-4 w-4 animate-spin" />
				) : (
					<Send className="h-4 w-4" />
				)}
			</Button>
		</form>
	);
}
