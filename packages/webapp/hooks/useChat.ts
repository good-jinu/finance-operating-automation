import { useEffect, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";
import { type Message, useChatStore } from "@/store/chat";

export const useChat = (sessionId = "session-123") => {
	const {
		messages,
		setHistory,
		addMessage,
		appendLastMessage,
		setIsStreaming,
	} = useChatStore();
	const [input, setInput] = useState("");
	const socketRef = useRef<Socket | null>(null);

	useEffect(() => {
		const newSocket = io("http://localhost:3001", {
			query: { sessionId },
			transports: ["websocket"],
		});
		socketRef.current = newSocket;

		newSocket.on("connect", () => {
			console.log("Socket.IO connected");
		});

		newSocket.on("history", (history: Message[]) => {
			setHistory(history);
		});

		let currentAiMessageId: string | null = null;
		let isNewMessage = true;

		newSocket.on("message", (message: { content: string; sender: "ai" }) => {
			if (isNewMessage) {
				currentAiMessageId = Date.now().toString();
				addMessage({ ...message, id: currentAiMessageId });
				setIsStreaming(true);
				isNewMessage = false;
			} else {
				appendLastMessage(message.content);
			}
		});

		newSocket.on("streamEnd", () => {
			setIsStreaming(false);
			currentAiMessageId = null;
			isNewMessage = true;
		});

		newSocket.on("disconnect", () => {
			console.log("Socket.IO disconnected");
		});

		return () => {
			newSocket.disconnect();
		};
	}, [sessionId, setHistory, addMessage, appendLastMessage, setIsStreaming]);

	const handleInputChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
	) => {
		setInput(e.target.value);
	};

	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const socket = socketRef.current;
		if (!input.trim() || !socket) return;

		const userMessage: Omit<Message, "id"> = {
			sender: "user",
			content: input,
		};

		socket.emit("sendMessage", userMessage);

		addMessage({ ...userMessage, id: Date.now().toString() });

		setInput("");
	};

	return {
		messages,
		input,
		handleInputChange,
		handleSubmit,
	};
};
