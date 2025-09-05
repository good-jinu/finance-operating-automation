"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ChatInterface from "./ChatInterface";

export default function ChatExample() {
	const [sessionId, setSessionId] = useState<string | undefined>(undefined);

	const startNewChat = () => {
		const newSessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
		setSessionId(newSessionId);
	};

	const clearChat = () => {
		setSessionId(undefined);
	};

	return (
		<div className="container mx-auto p-4 max-w-4xl">
			<Card className="h-[600px]">
				<CardHeader>
					<CardTitle className="flex items-center justify-between">
						<span>ChatAgent 테스트</span>
						<div className="flex gap-2">
							<Button onClick={startNewChat} variant="outline" size="sm">
								새 채팅
							</Button>
							<Button onClick={clearChat} variant="ghost" size="sm">
								채팅 초기화
							</Button>
						</div>
					</CardTitle>
					{sessionId && (
						<p className="text-sm text-muted-foreground">
							세션 ID: {sessionId}
						</p>
					)}
				</CardHeader>
				<CardContent className="h-[calc(100%-100px)]">
					<ChatInterface sessionId={sessionId} />
				</CardContent>
			</Card>

			{/* 사용법 안내 */}
			<Card className="mt-4">
				<CardHeader>
					<CardTitle className="text-lg">사용 예시</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="space-y-2">
						<p className="text-sm">
							💬 <strong>일반 대화:</strong> "안녕하세요"
						</p>
						<p className="text-sm">
							📧 <strong>이메일 조회:</strong> "오늘 온 메일을 보여줘"
						</p>
						<p className="text-sm">
							🏢 <strong>회사 검색:</strong> "ABC회사 정보를 알려줘"
						</p>
						<p className="text-sm">
							👤 <strong>수권자 관리:</strong> "김수권 수권자의 정보를 변경해줘"
						</p>
						<p className="text-sm">
							💳 <strong>계좌 관리:</strong> "결제계좌를 변경하고 싶어"
						</p>
						<p className="text-sm">
							🔒 <strong>인감 관리:</strong> "인감을 새로 등록하려고 해"
						</p>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
