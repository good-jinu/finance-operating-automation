"use client";

import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMails } from "@/hooks/useMails";
import { MailItem } from "./MailItem";

interface MailListProps {
	isUnreadOnly: boolean;
	onToggleUnreadOnly: () => void;
}

export function MailList({ isUnreadOnly, onToggleUnreadOnly }: MailListProps) {
	const { data: mailsData, isLoading, error } = useMails(isUnreadOnly);
	const mails = mailsData?.data || [];

	return (
		<div>
			<div className="flex items-center justify-between mb-3">
				<h4 className="text-sm font-medium">메일 목록</h4>
				<Button
					variant="outline"
					size="sm"
					onClick={onToggleUnreadOnly}
					className={
						isUnreadOnly ? "bg-primary text-primary-foreground" : ""
					}
				>
					{isUnreadOnly ? "전체 보기" : "읽지 않음만"}
				</Button>
			</div>
			{isLoading ? (
				<div className="flex items-center justify-center h-96">
					<RefreshCw className="w-6 h-6 animate-spin" />
					<span className="ml-2">메일 목록을 불러오는 중...</span>
				</div>
			) : error ? (
				<div className="flex items-center justify-center h-96 text-muted-foreground">
					메일 목록을 불러오는데 실패했습니다.
				</div>
			) : mails.length === 0 ? (
				<div className="flex items-center justify-center h-96 text-muted-foreground">
					메일이 없습니다. Sync 버튼을 눌러 메일을 동기화해보세요.
				</div>
			) : (
				<div className="h-[400px] overflow-auto">
					<div className="space-y-2">
						{mails.map((mail) => (
							<MailItem key={mail.id} mail={mail} />
						))}
					</div>
				</div>
			)}
		</div>
	);
}
