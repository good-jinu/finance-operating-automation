"use client";

import DashboardTab from "@/components/dashboard/tabs/DashboardTab";
import GuidelinesTab from "@/components/dashboard/tabs/GuidelinesTab";
import InboxTab from "@/components/dashboard/tabs/InboxTab";
import SentTab from "@/components/dashboard/tabs/SentTab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDashboard } from "@/hooks/useDashboard";

export default function MailsPage() {
	const {
		activeTab,
		setActiveTab,
		guideline,
		setGuideline,
		recentEmails,
		aiGuidelines,
	} = useDashboard();

	return (
		<div className="container mx-auto px-4 py-6">
			{/* Main Content */}
			<div className="lg:col-span-3">
				<Tabs
					value={activeTab}
					onValueChange={setActiveTab}
					className="space-y-6"
				>
					<TabsList className="grid w-full grid-cols-4">
						<TabsTrigger value="dashboard">대시보드</TabsTrigger>
						<TabsTrigger value="inbox">고객 요청</TabsTrigger>
						<TabsTrigger value="sent">처리 완료</TabsTrigger>
						<TabsTrigger value="guidelines">업무 규칙</TabsTrigger>
					</TabsList>

					<TabsContent value="dashboard">
						<DashboardTab recentEmails={recentEmails} />
					</TabsContent>

					<TabsContent value="inbox">
						<InboxTab recentEmails={recentEmails} />
					</TabsContent>

					<TabsContent value="sent">
						<SentTab recentEmails={recentEmails} />
					</TabsContent>

					<TabsContent value="guidelines">
						<GuidelinesTab
							aiGuidelines={aiGuidelines}
							guideline={guideline}
							onGuidelineChange={setGuideline}
						/>
					</TabsContent>
				</Tabs>
			</div>
		</div>
	);
}
