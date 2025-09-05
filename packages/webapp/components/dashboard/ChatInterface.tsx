"use client";

import { useEffect, useRef } from "react";
import { useChat } from "@/hooks/useChat";
import MessageInput from "./MessageInput";
import MessageList from "./MessageList";

interface ChatInterfaceProps {
	sessionId?: string;
}

export default function ChatInterface({ sessionId }: ChatInterfaceProps) {
	const { messages, input, handleInputChange, handleSubmit } = useChat(sessionId);
	const messagesEndRef = useRef<HTMLDivElement>(null);

	// 새 메시지가 추가될 때마다 자동 스크롤
	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages]);

	return (
		<div className="flex flex-col h-full">
			<div className="flex-1 overflow-y-auto p-4">
				<MessageList messages={messages} />
				{/* 자동 스크롤을 위한 엘리먼트 */}
				<div ref={messagesEndRef} />
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
