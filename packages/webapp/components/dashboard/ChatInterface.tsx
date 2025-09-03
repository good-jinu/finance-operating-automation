"use client";

import { useChat } from "@/hooks/useChat";
import MessageInput from "./MessageInput";
import MessageList from "./MessageList";

export default function ChatInterface() {
	const { messages, input, handleInputChange, handleSubmit } = useChat();

	return (
		<div className="flex flex-col h-full">
			<div className="flex-1 overflow-y-auto p-4">
				<MessageList messages={messages} />
			</div>
			<div className="p-4 border-t">
				<MessageInput
					input={input}
					handleInputChange={handleInputChange}
					handleSubmit={handleSubmit}
				/>
			</div>
		</div>
	);
}
