"use client";

import { Mail, RefreshCw } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { useMailSync } from "@/hooks/useMailSync";
import { AIReplyGenerationControl } from "./contents/AIReplyGenerationControl";
import { MailList } from "./contents/MailList";

export default function MailAndAutoReplySection() {
	const [isUnreadOnly, setIsUnreadOnly] = useState(false);
	const [isUnsentOnly, setIsUnsentOnly] = useState(true);
	const [selectedMailIds, setSelectedMailIds] = useState<number[]>([]);

	// 메일 동기화
	const syncMailsMutation = useMailSync();

	return (
		<Card className="h-[700px]">
			<CardHeader>
				<div className="flex items-center justify-between">
					<div>
						<CardTitle className="flex items-center gap-2">
							<Mail className="w-5 h-5" />
							메일 리스트 & AI 답변 관리
						</CardTitle>
						<CardDescription>
							Gmail 메일 목록과 AI 답변 생성/전송 기능을 관리하세요
						</CardDescription>
					</div>
					<div className="flex items-center gap-2">
						<Button
							onClick={() => syncMailsMutation.mutate()}
							disabled={syncMailsMutation.isPending}
							size="sm"
							variant="outline"
							className="gap-2"
						>
							<RefreshCw
								className={`w-4 h-4 ${syncMailsMutation.isPending ? "animate-spin" : ""}`}
							/>
							Sync
						</Button>
					</div>
				</div>
			</CardHeader>
			<CardContent className="space-y-4">
				{/* AI Reply Generation Control Section */}
				<AIReplyGenerationControl selectedMailIds={selectedMailIds} />

				{/* Unified Mail List with Reply Mails */}
				<MailList
					isUnreadOnly={isUnreadOnly}
					onToggleUnreadOnly={() => setIsUnreadOnly(!isUnreadOnly)}
					selectedMailIds={selectedMailIds}
					onSelectedMailIdsChange={setSelectedMailIds}
					isUnsentOnly={isUnsentOnly}
					onToggleUnsentOnly={() => setIsUnsentOnly(!isUnsentOnly)}
				/>
			</CardContent>
		</Card>
	);
}
