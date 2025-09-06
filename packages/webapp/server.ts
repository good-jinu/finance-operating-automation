import { createServer } from "node:http";
import { parse } from "node:url";
import { streamChatAgent } from "@finance-operating-automation/core/agents";
import {
	getChatHistory,
	saveChatMessage,
	streamGenerateReply,
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

			// Call the ChatAgent with streaming
			try {
				const agentStream = streamChatAgent(message.content, {
					thread_id: sessionId,
				});

				let fullResponse = "";
				const _isFirstChunk = true;

				for await (const streamResult of agentStream) {
					if (!streamResult.success) {
						console.error("ChatAgent 오류:", streamResult.error);
						socket.emit("message", {
							sender: "ai",
							content: "죄송합니다. 요청을 처리하는 중 오류가 발생했습니다.",
							isChunk: false,
						});
						break;
					}

					const chunk = streamResult.chunk ?? {};
					console.log("ChatAgent chunk:", chunk);

					// LangGraph stream의 updates 형식 처리
					for (const [node, values] of Object.entries(chunk)) {
						console.log(`Receiving update from node: ${node}`);
						console.log(values);
						console.log("\n====\n");

						// AI 응답 처리 (메시지 콘텐츠 추출)
						if (values && typeof values === "object" && "messages" in values) {
							const messages = values.messages;
							if (Array.isArray(messages)) {
								for (const msg of messages as any) {
									if (msg?.content && typeof msg.content === "string") {
										const content = msg.content;

										// AI 메시지인 경우만 처리
										if (
											msg.constructor.name === "AIMessage" ||
											msg._getType?.() === "ai"
										) {
											fullResponse += content;

											// 클라이언트로 청크 전솨
											socket.emit("message", {
												sender: "ai",
												content: content,
												isChunk: true,
											});
										}
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

		socket.on("generate-reply", async ({ mailId }: { mailId: number }) => {
			console.log(`[Socket.IO] Received generate-reply for mailId: ${mailId}`);

			try {
				const replyStream = streamGenerateReply(mailId);

				for await (const progress of replyStream) {
					socket.emit("agent-status", { message: progress.message });
				}

				socket.emit("generation-complete");
			} catch (error) {
				console.error("[Agent] Error processing generate-reply:", error);
				socket.emit("generation-error", {
					message:
						error instanceof Error
							? error.message
							: "AI 답변 생성 중 오류가 발생했습니다.",
				});
			}
		});
	});

	httpServer.listen(port, () => {
		console.log(`> Ready on http://localhost:${port}`);
		console.log(`> WebSocket server ready on ws://localhost:${port}`);
	});
});
