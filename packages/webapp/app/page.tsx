"use client";

import ChatInterface from "@/components/dashboard/ChatInterface";
import Header from "@/components/dashboard/Header";

export default function ChatPage() {
	return (
		<div className="flex flex-col h-screen bg-background">
			<Header />
			<main className="flex-1 overflow-hidden">
				<ChatInterface />
			</main>
		</div>
	);
}
