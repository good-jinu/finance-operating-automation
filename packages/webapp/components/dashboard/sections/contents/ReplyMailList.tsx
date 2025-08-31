"use client";

import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useReplyMails } from "@/hooks/useReplyMails";
import { ReplyMailItem } from "./ReplyMailItem";

interface ReplyMailListProps {
	isUnsentOnly: boolean;
	onToggleUnsentOnly: () => void;
}

export function ReplyMailList({ isUnsentOnly, onToggleUnsentOnly }: ReplyMailListProps) {
	const {
		data: replyMailsData,
		isLoading: isReplyMailsLoading,
		error: replyMailsError,
	} = useReplyMails(isUnsentOnly);

	return (
		<div>
			<div className="flex items-center justify-between mb-3">
				<h4 className="text-sm font-medium">답변 메일</h4>
				<Button
					variant="outline"
					size="sm"
					onClick={onToggleUnsentOnly}
					className={
						isUnsentOnly ? "bg-primary text-primary-foreground" : ""
					}
				>
					{isUnsentOnly ? "전체 보기" : "미전송만"}
				</Button>
			</div>
			{isReplyMailsLoading ? (
				<div className="flex items-center justify-center h-96">
					<RefreshCw className="w-6 h-6 animate-spin" />
					<span className="ml-2">답변 메일을 불러오는 중...</span>
				</div>
			) : replyMailsError ? (
				<div className="flex items-center justify-center h-96 text-muted-foreground">
					답변 메일 목록을 불러오는데 실패했습니다.
				</div>
			) : !replyMailsData?.data || replyMailsData.data.length === 0 ? (
				<div className="flex items-center justify-center h-96 text-muted-foreground">
					답변 메일이 없습니다. '답변 생성' 버튼을 눌러 답변을
					생성해보세요.
				</div>
			) : (
				<ScrollArea className="h-[400px]">
					<div className="space-y-2">
						{replyMailsData.data.map((replyMail) => (
							<ReplyMailItem key={replyMail.id} replyMail={replyMail} />
						))}
					</div>
				</ScrollArea>
			)}
		</div>
	);
}
