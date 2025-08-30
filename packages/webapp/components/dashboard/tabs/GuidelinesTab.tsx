import { Plus, Settings } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import type { AIGuideline } from "@/types/dashboard";

interface GuidelinesTabProps {
	aiGuidelines: AIGuideline[];
	guideline: string;
	onGuidelineChange: (value: string) => void;
}

export default function GuidelinesTab({
	aiGuidelines,
	guideline,
	onGuidelineChange,
}: GuidelinesTabProps) {
	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h2 className="text-2xl font-bold">FinOps 업무 규칙 설정</h2>
				<Button>
					<Plus className="w-4 h-4 mr-2" />새 규칙 추가
				</Button>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>새 업무 규칙 만들기</CardTitle>
					<CardDescription>
						AI에게 금융 업무를 어떻게 처리할지 알려주세요
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<Textarea
						placeholder="예: '수권자 변경 신청'이 접수되면, 법인등기부등본과 주주명부 최신본 요청 후 '필요 서류 안내드립니다. 법인등기부등본(3개월 이내)과 주주명부를 제출해 주세요.'라고 답장해줘"
						value={guideline}
						onChange={(e) => onGuidelineChange(e.target.value)}
						className="min-h-20"
					/>
					<Button className="w-full">업무 규칙 저장</Button>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>활성 업무 규칙</CardTitle>
					<CardDescription>현재 적용 중인 FinOps 처리 규칙들</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="space-y-3">
						{aiGuidelines.map((guideline) => (
							<div
								key={guideline.id}
								className="flex items-center justify-between p-3 border rounded-lg"
							>
								<span className="text-sm">{guideline.rule}</span>
								<div className="flex items-center gap-2">
									<Badge variant={guideline.active ? "default" : "secondary"}>
										{guideline.active ? "활성" : "비활성"}
									</Badge>
									<Button variant="ghost" size="sm">
										<Settings className="w-4 h-4" />
									</Button>
								</div>
							</div>
						))}
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
