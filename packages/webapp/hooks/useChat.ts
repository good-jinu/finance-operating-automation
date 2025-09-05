import { useEffect, useRef, useState } from "react";
import { socket } from "@/lib/socket";
import { type Message, useChatStore } from "@/store/chat";

export const useChat = (sessionId?: string) => {
	// 세션 ID가 없으면 고유 ID 생성
	const generatedSessionId =
		sessionId ||
		`session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
	const {
		messages,
		setHistory,
		addMessage,
		appendLastMessage,
		setIsStreaming,
	} = useChatStore();
	const [input, setInput] = useState("");
	const _socketRef = useRef(socket);

	useEffect(() => {
		// Configure socket connection
		socket.io.opts.query = { sessionId: generatedSessionId };
		socket.io.opts.transports = ["websocket"];

		// Connect if not already connected
		if (!socket.connected) {
			socket.connect();
		}

		socket.on("connect", () => {
			console.log("Socket.IO connected");
		});

		socket.on("history", (history: Message[]) => {
			setHistory(history);
		});

		let currentAiMessageId: string | null = null;
		let isNewMessage = true;

		socket.on("message", (message: { content: string; sender: "ai" }) => {
			if (isNewMessage) {
				currentAiMessageId = Date.now().toString();
				addMessage({ ...message, id: currentAiMessageId });
				setIsStreaming(true);
				isNewMessage = false;
			} else {
				appendLastMessage(message.content);
			}
		});

		socket.on("streamEnd", () => {
			setIsStreaming(false);
			currentAiMessageId = null;
			isNewMessage = true;
		});

		socket.on("disconnect", () => {
			console.log("Socket.IO disconnected");
		});

		return () => {
			socket.off("connect");
			socket.off("history");
			socket.off("message");
			socket.off("streamEnd");
			socket.off("disconnect");
		};
	}, [
		generatedSessionId,
		setHistory,
		addMessage,
		appendLastMessage,
		setIsStreaming,
	]);

	const handleInputChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
	) => {
		setInput(e.target.value);
	};

	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (!input.trim() || !socket.connected) return;

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
