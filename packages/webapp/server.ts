import { createServer } from "node:http";
import { parse } from "node:url";
import { streamRouterAgent } from "@finance-operating-automation/core/agents";
import {
	getChatHistory,
	saveChatMessage,
} from "@finance-operating-automation/core/services";
import next from "next";
import { Server } from "socket.io";

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev, dir: __dirname });
const handle = app.getRequestHandler();

const port = process.env.PORT || 3000;

app.prepare().then(() => {
	const httpServer = createServer((req, res) => {
		const parsedUrl = parse(req.url ?? "https://localhost:3000", true);
		handle(req, res, parsedUrl);
	});

	const io = new Server(httpServer, {
		cors: {
			origin: "*", // In production, you should restrict this to your frontend's URL
			methods: ["GET", "POST"],
		},
	});

	io.on("connection", async (socket) => {
		const sessionId = (socket.handshake.query.sessionId as string) || socket.id;
		console.log(
			`[Socket.IO] A client connected: ${socket.id} with session ID: ${sessionId}`,
		);

		// Load history and send to the client
		try {
			const history = getChatHistory(sessionId);
			socket.emit("history", history);
		} catch (error) {
			console.error("[DB] Error fetching history:", error);
		}

		socket.on("sendMessage", async (message) => {
			console.log(`[Socket.IO] Received message:`, message);

			// Save user message to DB
			try {
				saveChatMessage({ ...message, session_id: sessionId });
			} catch (error) {
				console.error("[DB] Error saving user message:", error);
			}

			// Call the AI agent with streaming
			try {
				const agentStream = await streamRouterAgent(message.content);

				let fullResponse = "";
				let currentMessageId: string | null = null;

				for await (const chunk of agentStream) {
					console.log("Receiving chunk:", chunk);

					// LangGraph stream의 updates 형식 처리
					for (const [node, values] of Object.entries(chunk)) {
						console.log(`Receiving update from node: ${node}`);
						console.log(values);
						console.log("\n====\n");

						// AI 응답 처리 (노드에서 메시지 콘텐츠 추출)
						if (values && typeof values === "object" && "messages" in values) {
							const messages = values.messages;
							if (Array.isArray(messages)) {
								for (const msg of messages) {
									if (msg?.content && typeof msg.content === "string") {
										const content = msg.content;

										// 메시지 ID 추적 (같은 메시지의 청크들을 그룹화)
										const messageId = msg.id || `${Date.now()}-${node}`;
										if (messageId !== currentMessageId) {
											currentMessageId = messageId;
										}

										fullResponse += content;

										// 클라이언트로 청크 전송
										socket.emit("message", {
											sender: "ai",
											content: content,
											messageId: currentMessageId,
											isChunk: true,
										});
									}
								}
							}
						}

						// 단순한 텍스트 응답 처리
						if (typeof values === "string") {
							fullResponse += values;
							socket.emit("message", {
								sender: "ai",
								content: values,
								messageId: `${Date.now()}-${node}`,
								isChunk: true,
							});
						}
					}
				}

				// Save the full AI response to the database
				if (fullResponse) {
					try {
						saveChatMessage({
							session_id: sessionId,
							sender: "ai",
							content: fullResponse,
						});
					} catch (error) {
						console.error("[DB] Error saving AI message:", error);
					}
				}

				// Signal the end of the stream
				socket.emit("streamEnd");
			} catch (error) {
				console.error("[Agent] Error processing message:", error);
				socket.emit("message", {
					id: `${Date.now()}-error`,
					sender: "ai",
					content: "죄송합니다. 요청을 처리하는 중 오류가 발생했습니다.",
				});
				socket.emit("streamEnd"); // Also end stream on error
			}
		});

		socket.on("disconnect", () => {
			console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
		});
	});

	httpServer.listen(port, () => {
		console.log(`> Ready on http://localhost:${port}`);
		console.log(`> WebSocket server ready on ws://localhost:${port}`);
	});
});
