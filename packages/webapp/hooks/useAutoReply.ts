import { useCallback, useState } from "react";
import type { AutoReplyLog } from "@/types/dashboard";

export function useAutoReply() {
	const [isAutoReplyRunning, setIsAutoReplyRunning] = useState(false);
	const [autoReplyProgress, setAutoReplyProgress] = useState(0);
	const [processedEmails, setProcessedEmails] = useState(0);
	const [totalUnreadEmails, setTotalUnreadEmails] = useState(0);
	const [autoReplyLogs, setAutoReplyLogs] = useState<AutoReplyLog[]>([]);

	const handleAutoReply = useCallback(async () => {
		setIsAutoReplyRunning(true);
		setAutoReplyProgress(0);
		setProcessedEmails(0);

		try {
			// API 호출로 자동 답변 시작
			const response = await fetch("/api/auto-reply", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || "자동 답변을 시작할 수 없습니다.");
			}

			const result = await response.json();
			console.log("자동 답변 시작:", result);

			// 진행 상황을 주기적으로 확인
			const checkProgress = async () => {
				try {
					const statusResponse = await fetch("/api/auto-reply?action=status");
					if (statusResponse.ok) {
						const statusData = await statusResponse.json();

						if (statusData.session && statusData.progress) {
							const { progress } = statusData;
							setTotalUnreadEmails(progress.totalEmails);
							setProcessedEmails(progress.processedEmails);
							setAutoReplyProgress(
								(progress.processedEmails / progress.totalEmails) * 100,
							);

							if (progress.currentEmail) {
								const emailData: AutoReplyLog = {
									id: `email-${Date.now()}`,
									subject: progress.currentEmail.subject,
									sender: progress.currentEmail.sender,
									status: progress.currentEmail.status,
									timestamp: new Date().toLocaleTimeString("ko-KR"),
									message:
										progress.currentEmail.status === "success"
											? "자동 답변 전송 완료"
											: "답변 전송 중 오류 발생",
								};

								setAutoReplyLogs((prev) => {
									const existing = prev.find(
										(log) =>
											log.subject === emailData.subject &&
											log.sender === emailData.sender,
									);
									if (existing) {
										return prev.map((log) =>
											log.subject === emailData.subject &&
											log.sender === emailData.sender
												? {
														...log,
														status: emailData.status,
														message: emailData.message,
													}
												: log,
										);
									}
									return [emailData, ...prev.slice(0, 9)];
								});
							}

							if (
								progress.status === "completed" ||
								progress.status === "error"
							) {
								setIsAutoReplyRunning(false);
								return;
							}
						} else {
							setIsAutoReplyRunning(false);
							return;
						}
					}
				} catch (error) {
					console.error("진행 상황 확인 오류:", error);
				}

				// 실행 중이면 3초 후 다시 확인
				if (isAutoReplyRunning) {
					setTimeout(checkProgress, 3000);
				}
			};

			// 진행 상황 확인 시작
			setTimeout(checkProgress, 1000);
		} catch (error) {
			console.error("자동 답변 처리 중 오류:", error);
			setIsAutoReplyRunning(false);
		}
	}, [isAutoReplyRunning]);

	const handleStopAutoReply = useCallback(async () => {
		try {
			const response = await fetch("/api/auto-reply", {
				method: "DELETE",
			});

			if (response.ok) {
				setIsAutoReplyRunning(false);
				setAutoReplyProgress(0);
			}
		} catch (error) {
			console.error("자동 답변 중지 오류:", error);
			setIsAutoReplyRunning(false);
		}
	}, []);

	return {
		isAutoReplyRunning,
		autoReplyProgress,
		processedEmails,
		totalUnreadEmails,
		autoReplyLogs,
		handleAutoReply,
		handleStopAutoReply,
	};
}
