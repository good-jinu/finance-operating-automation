"use client";

import AIChatSidebar from "@/components/dashboard/AIChatSidebar";
import Header from "@/components/dashboard/Header";
import DashboardTab from "@/components/dashboard/tabs/DashboardTab";
import GuidelinesTab from "@/components/dashboard/tabs/GuidelinesTab";
import InboxTab from "@/components/dashboard/tabs/InboxTab";
import SentTab from "@/components/dashboard/tabs/SentTab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAutoReply } from "@/hooks/useAutoReply";
import { useDashboard } from "@/hooks/useDashboard";

export default function AIEmailDashboard() {
	const {
		activeTab,
		setActiveTab,
		chatMessage,
		setChatMessage,
		guideline,
		setGuideline,
		finOpsStats,
		recentEmails,
		aiGuidelines,
	} = useDashboard();

	const {
		isAutoReplyRunning,
		autoReplyProgress,
		processedEmails,
		totalUnreadEmails,
		autoReplyLogs,
		handleAutoReply,
		handleStopAutoReply,
	} = useAutoReply();

	return (
		<div className="min-h-screen bg-background">
			<Header />

			<div className="container mx-auto px-4 py-6">
				<div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
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
								<DashboardTab
									stats={finOpsStats}
									recentEmails={recentEmails}
									isAutoReplyRunning={isAutoReplyRunning}
									autoReplyProgress={autoReplyProgress}
									processedEmails={processedEmails}
									totalUnreadEmails={totalUnreadEmails}
									autoReplyLogs={autoReplyLogs}
									onStartAutoReply={handleAutoReply}
									onStopAutoReply={handleStopAutoReply}
								/>
							</TabsContent>

							<TabsContent value="inbox">
								<InboxTab
									recentEmails={recentEmails}
									isAutoReplyRunning={isAutoReplyRunning}
									processedEmails={processedEmails}
									totalUnreadEmails={totalUnreadEmails}
								/>
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

					{/* AI Chatbot Sidebar */}
					<div className="lg:col-span-1">
						<AIChatSidebar
							chatMessage={chatMessage}
							onChatMessageChange={setChatMessage}
							onStartAutoReply={handleAutoReply}
							isAutoReplyRunning={isAutoReplyRunning}
						/>
					</div>
				</div>
			</div>
		</div>
	);
}
