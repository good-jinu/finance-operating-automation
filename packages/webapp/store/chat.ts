import { create } from "zustand";

export interface Message {
	id: string;
	sender: "user" | "ai";
	content: string;
}

interface ChatState {
	messages: Message[];
	currentSessionId: string | null;
	setHistory: (messages: Message[]) => void;
	addMessage: (message: Message) => void;
	appendLastMessage: (chunk: string) => void;
	isStreaming: boolean;
	setIsStreaming: (isStreaming: boolean) => void;
	setCurrentSessionId: (sessionId: string) => void;
	clearChat: () => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
	messages: [],
	currentSessionId: null,
	isStreaming: false,
	setHistory: (messages) => set({ messages }),
	addMessage: (message) => {
		// If the new message is a user message or the first AI message, add it.
		// If it's a subsequent AI chunk, it should be handled by appendLastMessage.
		if (
			message.sender === "user" ||
			get().messages[get().messages.length - 1]?.sender === "user"
		) {
			set((state) => ({
				messages: [...state.messages, message],
				isStreaming: message.sender === "ai",
			}));
		} else {
			// This handles the case where an AI message is not streaming and should be added as a whole.
			set((state) => ({ messages: [...state.messages, message] }));
		}
	},
	appendLastMessage: (chunk) => {
		if (!get().isStreaming) return; // Don't append if not streaming

		set((state) => {
			const lastMessage = state.messages[state.messages.length - 1];
			if (lastMessage && lastMessage.sender === "ai") {
				const updatedMessages = [...state.messages];
				updatedMessages[updatedMessages.length - 1] = {
					...lastMessage,
					content: lastMessage.content + chunk,
				};
				return { messages: updatedMessages };
			}
			return state;
		});
	},
	setIsStreaming: (isStreaming) => set({ isStreaming }),
	setCurrentSessionId: (sessionId) => set({ currentSessionId: sessionId }),
	clearChat: () => set({ messages: [], isStreaming: false }),
}));
