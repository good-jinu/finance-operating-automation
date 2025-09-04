"use client";

import type { ReplyMailWithOriginal } from "@finance-operating-automation/core/models";
import {Check, Edit, Paperclip, RefreshCw, Send, Trash2, User, X} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {useDeleteReplyMail, useSendReplyMail, useUpdateReplyMail} from "@/hooks/useReplyMails";
import { useDownloadStaticAttachment } from "@/hooks/useStaticAttachments";
import { parseAttachments } from "@/lib/attachmentUtils";

interface ReplyMailItemProps {
	replyMail: ReplyMailWithOriginal;
}

export function ReplyMailItem({ replyMail }: ReplyMailItemProps) {
	const [isEditing, setIsEditing] = useState(false);
	const [editedSubject, setEditedSubject] = useState(replyMail.subject);
	const [editedBody, setEditedBody] = useState(replyMail.reply_body);

	const sendReplyMailMutation = useSendReplyMail();
	const updateReplyMailMutation = useUpdateReplyMail();
	const deleteReplyMailMutation = useDeleteReplyMail();
	const downloadAttachmentMutation = useDownloadStaticAttachment();

	const attachments = replyMail.attachments
		? parseAttachments(replyMail.attachments)
		: [];

	const handleDownloadAttachment = (attachment: string) => {
		if (!attachment) {
			return;
		}

		downloadAttachmentMutation.mutate({
			filename: attachment,
		});
	};

	const handleEdit = () => {
		setIsEditing(true);
		setEditedSubject(replyMail.subject);
		setEditedBody(replyMail.reply_body);
	};

	const handleCancelEdit = () => {
		setIsEditing(false);
		setEditedSubject(replyMail.subject);
		setEditedBody(replyMail.reply_body);
	};

	const handleSaveEdit = async () => {
		if (!replyMail.id) return;

		try {
			await updateReplyMailMutation.mutateAsync({
				id: replyMail.id,
				subject: editedSubject,
				reply_body: editedBody,
			});
			setIsEditing(false);
			toast.success("메일이 성공적으로 수정되었습니다.");
		} catch (error) {
			toast.error("메일 수정에 실패했습니다.");
		}
	};

	const handleSend = () => {
		if (!replyMail.id) return;
		sendReplyMailMutation.mutate(replyMail.id);
	};

	const handleDelete = async () => {
		if (!replyMail.id) return;

		// 삭제 확인
		const confirmed = window.confirm("정말 이 답변 메일을 삭제하시겠습니까?");
		if (!confirmed) return;

		try {
			await deleteReplyMailMutation.mutateAsync(replyMail.id);
			toast.success("메일이 성공적으로 삭제되었습니다.");
		} catch (error) {
			toast.error("메일 삭제에 실패했습니다.");
		}
	};

	return (
		<div
			className={`p-4 rounded-xl border-2 transition-all duration-200 ${
				!replyMail.is_sent
					? "border-orange-200 bg-gradient-to-br from-orange-50/80 to-orange-100/50 shadow-sm"
					: "border-green-200 bg-gradient-to-br from-green-50/80 to-green-100/50 shadow-sm"
			} ${isEditing ? "ring-2 ring-blue-200 border-blue-300" : ""}`}
		>
			<div className="flex items-start gap-4">
				<Avatar className="w-12 h-12 border-2 border-white shadow-sm">
					<AvatarFallback className="bg-gradient-to-br from-gray-100 to-gray-200 text-gray-600">
						<User className="w-5 h-5" />
					</AvatarFallback>
				</Avatar>
				<div className="flex-1 min-w-0 space-y-3">
					{/* Header */}
					<div className="flex items-center gap-3 flex-wrap">
						<p className="text-sm font-semibold text-gray-800 truncate">
							답장: {replyMail.original_sender}
						</p>
						{attachments.length > 0 && (
							<div className="flex items-center gap-1">
								<Paperclip className="w-3 h-3 text-gray-500" />
								<span className="text-xs text-gray-500">
									{attachments.length}개
								</span>
							</div>
						)}
						<Badge
							variant={replyMail.is_sent ? "default" : "secondary"}
							className={`text-xs font-medium ${
								replyMail.is_sent
									? "bg-green-600 text-white"
									: "bg-orange-600 text-white"
							}`}
						>
							{replyMail.is_sent ? "전송완료" : "미전송"}
						</Badge>
						<span className="text-xs text-gray-500 ml-auto">
							{new Date(replyMail.created_at || "").toLocaleDateString("ko-KR")}
						</span>
					</div>

					{/* Subject */}
					<div className="space-y-2">
						<label className="text-xs font-medium text-gray-600">제목</label>
						{isEditing ? (
							<Input
								value={editedSubject}
								onChange={(e) => setEditedSubject(e.target.value)}
								className="text-sm font-medium"
								placeholder="제목을 입력하세요"
							/>
						) : (
							<p className="text-sm font-semibold text-gray-800 bg-white/60 rounded-lg px-3 py-2 border">
								{replyMail.subject}
							</p>
						)}
					</div>

					{/* Original Subject */}
					<div className="text-xs text-gray-600 bg-gray-100/60 rounded-lg px-3 py-2">
						<span className="font-medium">원본 메일:</span>{" "}
						{replyMail.original_subject}
					</div>

					{/* Reply Body */}
					<div className="space-y-2">
						<label className="text-xs font-medium text-gray-600">
							답변 내용
						</label>
						{isEditing ? (
							<Textarea
								value={editedBody}
								onChange={(e) => setEditedBody(e.target.value)}
								className="min-h-[120px] text-sm resize-none"
								placeholder="답변 내용을 입력하세요"
							/>
						) : (
							<div className="text-sm text-gray-700 bg-white/60 rounded-lg p-3 border min-h-[80px] whitespace-pre-wrap">
								{replyMail.reply_body}
							</div>
						)}
					</div>

					{/* Attachments */}
					{attachments.length > 0 && (
						<div className="space-y-2">
							<div className="flex items-center gap-2">
								<Paperclip className="w-4 h-4 text-gray-500" />
								<span className="text-xs font-medium text-gray-600">
									첨부파일 ({attachments.length}개)
								</span>
							</div>
							<div className="flex flex-wrap gap-2">
								{attachments.map((attachment: string, index: number) => (
									<Badge
										key={attachment || index}
										variant="outline"
										className="text-xs px-3 py-1.5 cursor-pointer hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition-colors bg-white/80"
										onClick={() => handleDownloadAttachment(attachment)}
										title={`${attachment || `첨부파일 ${index + 1}`} 다운로드`}
									>
										{attachment || `첨부파일 ${index + 1}`}
									</Badge>
								))}
							</div>
						</div>
					)}

					{/* Actions */}
					<div className="flex items-center gap-2 pt-2">
						{!replyMail.is_sent && (
							<>
								{isEditing ? (
									<>
										<Button
											size="sm"
											variant="default"
											onClick={handleSaveEdit}
											disabled={updateReplyMailMutation.isPending}
											className="gap-2 bg-blue-600 hover:bg-blue-700"
										>
											{updateReplyMailMutation.isPending ? (
												<RefreshCw className="w-3 h-3 animate-spin" />
											) : (
												<Check className="w-3 h-3" />
											)}
											저장
										</Button>
										<Button
											size="sm"
											variant="outline"
											onClick={handleCancelEdit}
											className="gap-2"
										>
											<X className="w-3 h-3" />
											취소
										</Button>
									</>
								) : (
									<>
										<Button
											size="sm"
											variant="outline"
											onClick={handleEdit}
											className="gap-2 border-blue-200 text-blue-700 hover:bg-blue-50"
										>
											<Edit className="w-3 h-3" />
											편집
										</Button>
										<Button
											size="sm"
											variant="default"
											onClick={handleSend}
											disabled={sendReplyMailMutation.isPending}
											className="gap-2 bg-green-600 hover:bg-green-700"
										>
											{sendReplyMailMutation.isPending ? (
												<RefreshCw className="w-3 h-3 animate-spin" />
											) : (
												<Send className="w-3 h-3" />
											)}
											전송
										</Button>
											<Button
												size="sm"
												variant="outline"
												onClick={handleDelete}
												disabled={deleteReplyMailMutation.isPending}
												className="gap-2 border-red-200 text-red-700 hover:bg-red-50"
											>
												{deleteReplyMailMutation.isPending ? (
													<RefreshCw className="w-3 h-3 animate-spin" />
												) : (
													<Trash2 className="w-3 h-3" />
												)}
												삭제
											</Button>
									</>
								)}
							</>
						)}
						{replyMail.sent_at && (
							<span className="text-xs text-gray-500 ml-auto">
								전송일:{" "}
								{new Date(replyMail.sent_at).toLocaleDateString("ko-KR")}
							</span>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
