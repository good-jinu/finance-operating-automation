"use client";

import { Play, RefreshCw, Settings } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useGenerateReplies } from "@/hooks/useReplyMails";

export function AIReplyGenerationControl() {
	const generateRepliesMutation = useGenerateReplies();

	return (
		<div className="p-4 bg-muted/20 rounded-lg space-y-4">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-4">
					<div className="text-sm">
						<span className="font-medium">답변 생성 상태: </span>
						<Badge
							variant={
								generateRepliesMutation.isPending
									? "secondary"
									: generateRepliesMutation.isError
										? "destructive"
										: generateRepliesMutation.isSuccess
											? "outline"
											: "secondary"
							}
						>
							{generateRepliesMutation.isPending
								? "생성 중..."
								: generateRepliesMutation.isError
									? "오류"
									: generateRepliesMutation.isSuccess
										? "완료"
										: "대기"}
						</Badge>
					</div>
					{generateRepliesMutation.isError &&
						generateRepliesMutation.error && (
							<div className="text-sm text-destructive">
								{generateRepliesMutation.error.message}
							</div>
						)}
				</div>
				<div className="flex items-center gap-2">
					<Button
						onClick={() => generateRepliesMutation.mutate()}
						className="gap-2"
						size="sm"
						disabled={generateRepliesMutation.isPending}
					>
						{generateRepliesMutation.isPending ? (
							<RefreshCw className="w-4 h-4 animate-spin" />
						) : (
							<Play className="w-4 h-4" />
						)}
						{generateRepliesMutation.isPending ? "생성 중..." : "답변 생성"}
					</Button>
					<Button variant="outline" size="sm">
						<Settings className="w-4 h-4" />
					</Button>
				</div>
			</div>
		</div>
	);
}
