"use client";

import { RefreshCw } from "lucide-react";
import { useEffect, useId } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useMails } from "@/hooks/useMails";
import { useReplyMails } from "@/hooks/useReplyMails";
import { MailItem } from "./MailItem";

interface MailListProps {
	isUnreadOnly: boolean;
	onToggleUnreadOnly: () => void;
	selectedMailIds: number[];
	onSelectedMailIdsChange: (ids: number[]) => void;
	isUnsentOnly: boolean;
	onToggleUnsentOnly: () => void;
}

export function MailList({
	isUnreadOnly,
	onToggleUnreadOnly,
	selectedMailIds,
	onSelectedMailIdsChange,
	isUnsentOnly,
	onToggleUnsentOnly,
}: MailListProps) {
	const { data: mailsData, isLoading, error } = useMails(isUnreadOnly);
	const {
		data: replyMailsData,
		isLoading: isReplyMailsLoading,
		error: replyMailsError,
	} = useReplyMails(isUnsentOnly);

	const mails = mailsData?.data || [];
	const replyMails = replyMailsData?.data || [];
	const selectAllId = useId();

	useEffect(() => {
		onSelectedMailIdsChange([]);
	}, [onSelectedMailIdsChange]);

	const handleSelectAll = (checked: boolean) => {
		if (checked) {
			onSelectedMailIdsChange(mails.map((mail) => mail.id ?? NaN));
		} else {
			onSelectedMailIdsChange([]);
		}
	};

	const handleSelectOne = (id: number, checked: boolean) => {
		if (checked) {
			onSelectedMailIdsChange([...selectedMailIds, id]);
		} else {
			onSelectedMailIdsChange(
				selectedMailIds.filter((mailId) => mailId !== id),
			);
		}
	};

	const areAllSelected =
		mails.length > 0 && selectedMailIds.length === mails.length;

	const isLoadingAny = isLoading || isReplyMailsLoading;
	const hasError = error || replyMailsError;

	return (
		<div>
			<div className="flex items-center justify-between mb-3">
				<div className="flex items-center gap-2">
					<Checkbox
						id={selectAllId}
						checked={areAllSelected}
						onCheckedChange={handleSelectAll}
						disabled={mails.length === 0}
						className="border border-neutral-500"
					/>
					<label htmlFor="select-all" className="text-sm font-medium">
						{areAllSelected ? "전체 선택 해제" : "전체 선택"} (
						{selectedMailIds.length})
					</label>
				</div>
				<div className="flex items-center gap-2">
					<Button
						variant="outline"
						size="sm"
						onClick={onToggleUnreadOnly}
						className={isUnreadOnly ? "bg-primary text-primary-foreground" : ""}
					>
						{isUnreadOnly ? "전체 보기" : "읽지 않음만"}
					</Button>
					<Button
						variant="outline"
						size="sm"
						onClick={onToggleUnsentOnly}
						className={isUnsentOnly ? "bg-orange-500 text-white" : ""}
					>
						{isUnsentOnly ? "전체 답변" : "미전송만"}
					</Button>
				</div>
			</div>
			{isLoadingAny ? (
				<div className="flex items-center justify-center h-96">
					<RefreshCw className="w-6 h-6 animate-spin" />
					<span className="ml-2">메일 목록을 불러오는 중...</span>
				</div>
			) : hasError ? (
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
							<MailItem
								key={mail.id}
								mail={mail}
								isSelected={selectedMailIds.includes(mail.id ?? NaN)}
								onSelectChange={(checked) =>
									handleSelectOne(mail.id ?? NaN, checked)
								}
								replyMails={replyMails.filter(
									(reply) => reply.original_message_id === mail.message_id,
								)}
							/>
						))}
					</div>
				</div>
			)}
		</div>
	);
}
