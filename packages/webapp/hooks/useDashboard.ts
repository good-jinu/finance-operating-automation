import { useState } from "react";
import type {
	AIGuideline,
	Email,
	FinOpsStats,
	TabValue,
} from "@/types/dashboard";

export function useDashboard() {
	const [activeTab, setActiveTab] = useState<TabValue>("dashboard");
	const [guideline, setGuideline] = useState("");

	const finOpsStats: FinOpsStats = {
		authorityChange: 23,
		accountChange: 18,
		sealChange: 15,
		pendingApproval: 8,
	};

	const recentEmails: Email[] = [
		{
			id: 1,
			sender: "김철수 (ABC기업)",
			subject: "법인 수권자 변경 신청",
			preview:
				"AI 요약: 대표이사 변경에 따른 수권자 변경 신청서 및 필요 서류 제출",
			time: "2분 전",
			category: "수권자 변경",
			isAI: false,
		},
		{
			id: 2,
			sender: "이영희 (DEF상사)",
			subject: "자동이체 계좌 변경 요청",
			preview: "AI 요약: 월 결제계좌를 국민은행에서 신한은행으로 변경 요청",
			time: "15분 전",
			category: "계좌 변경",
			isAI: false,
		},
		{
			id: 3,
			sender: "AI 어시스턴트",
			subject: "자동 처리: 인감 변경 승인 완료",
			preview:
				"GHI corporation 인감 변경 신청이 가이드라인에 따라 자동 승인되었습니다.",
			time: "1시간 전",
			category: "AI 처리",
			isAI: true,
		},
		{
			id: 4,
			sender: "박민수 (JKL기업)",
			subject: "인감증명서 재발급 신청",
			preview:
				"AI 요약: 기존 인감 분실로 인한 신규 인감 등록 및 증명서 재발급 요청",
			time: "2시간 전",
			category: "인감 변경",
			isAI: false,
		},
	];

	const aiGuidelines: AIGuideline[] = [
		{
			id: 1,
			rule: "수권자 변경 신청 시 필수 서류 체크 후 자동 안내",
			active: true,
		},
		{ id: 2, rule: "계좌 변경 요청 시 기존 계좌 잔액 확인 안내", active: true },
		{
			id: 3,
			rule: "인감 변경 신청 시 법인등기부등본 최신본 요구",
			active: false,
		},
		{
			id: 4,
			rule: "고액 거래 관련 문의 시 관리자에게 즉시 알림",
			active: true,
		},
	];

	return {
		activeTab,
		setActiveTab: (value: string) => {
			switch (value) {
				case "dashboard":
					setActiveTab("dashboard");
					break;
				case "inbox":
					setActiveTab("inbox");
					break;
				case "sent":
					setActiveTab("sent");
					break;
				case "guidelines":
					setActiveTab("guidelines");
					break;
			}
		},
		guideline,
		setGuideline,
		finOpsStats,
		recentEmails,
		aiGuidelines,
	};
}
