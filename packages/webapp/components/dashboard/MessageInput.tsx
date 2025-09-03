import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
	return (
		<form onSubmit={handleSubmit} className="flex items-center gap-2">
			<Input
				value={input}
				onChange={handleInputChange}
				placeholder="메시지를 입력하세요..."
				className="flex-1"
			/>
			<Button type="submit" size="icon">
				<Send className="h-4 w-4" />
			</Button>
		</form>
	);
}
