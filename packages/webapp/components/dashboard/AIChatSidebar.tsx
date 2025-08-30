import { Bot, Mail, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

interface AIChatSidebarProps {
	chatMessage: string;
	onChatMessageChange: (value: string) => void;
	onStartAutoReply: () => void;
	isAutoReplyRunning: boolean;
}

export default function AIChatSidebar({
	chatMessage,
	onChatMessageChange,
	onStartAutoReply,
	isAutoReplyRunning,
}: AIChatSidebarProps) {
	return (
		<Card className="sticky top-24">
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Bot className="w-5 h-5" />
					FinOps AI 어시스턴트
				</CardTitle>
				<CardDescription>금융 업무 처리를 도와드립니다</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				<ScrollArea className="h-64 p-3 border rounded-lg">
					<div className="space-y-3">
						<div className="bg-muted p-3 rounded-lg">
							<p className="text-sm">
								안녕하세요! 오늘 수권자 변경 신청 2건, 계좌 변경 요청 3건이
								도착했습니다. 우선순위에 따라 처리해드릴까요?
							</p>
						</div>
						<div className="bg-primary text-primary-foreground p-3 rounded-lg ml-8">
							<p className="text-sm">네, 긴급한 것부터 처리해주세요.</p>
						</div>
						<div className="bg-muted p-3 rounded-lg">
							<p className="text-sm">
								ABC기업의 수권자 변경이 가장 긴급합니다. 필요 서류를 확인하고
								자동 안내 메일을 발송했습니다. DEF상사의 계좌변경도 승인 대기
								상태입니다.
							</p>
						</div>
					</div>
				</ScrollArea>

				<div className="space-y-2">
					<Input
						placeholder="메시지를 입력하세요..."
						value={chatMessage}
						onChange={(e) => onChatMessageChange(e.target.value)}
					/>
					<Button className="w-full">
						<Send className="w-4 h-4 mr-2" />
						전송
					</Button>
				</div>

				<div className="space-y-2">
					<p className="text-sm font-medium">빠른 작업</p>
					<div className="grid grid-cols-2 gap-2">
						<Button
							variant="outline"
							size="sm"
							onClick={onStartAutoReply}
							disabled={isAutoReplyRunning}
						>
							<Mail className="w-3 h-3 mr-1" />
							자동 답변
						</Button>
						<Button variant="outline" size="sm">
							수권자 변경
						</Button>
						<Button variant="outline" size="sm">
							계좌 변경
						</Button>
						<Button variant="outline" size="sm">
							인감 변경
						</Button>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
