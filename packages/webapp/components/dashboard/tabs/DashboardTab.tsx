import type { AutoReplyLog, Email, FinOpsStats } from "@/types/dashboard";
import MailAndAutoReplySection from "../sections/MailAndAutoReplySection";
import RecentActivitySection from "../sections/RecentActivitySection";

interface DashboardTabProps {
	stats: FinOpsStats;
	recentEmails: Email[];
	isAutoReplyRunning: boolean;
	autoReplyProgress: number;
	processedEmails: number;
	totalUnreadEmails: number;
	autoReplyLogs: AutoReplyLog[];
	onStartAutoReply: () => void;
	onStopAutoReply: () => void;
}

export default function DashboardTab({
	recentEmails,
	isAutoReplyRunning,
	autoReplyProgress,
	processedEmails,
	totalUnreadEmails,
	autoReplyLogs,
	onStartAutoReply,
	onStopAutoReply,
}: DashboardTabProps) {
	return (
		<div className="space-y-6">
			<MailAndAutoReplySection
				isAutoReplyRunning={isAutoReplyRunning}
				autoReplyProgress={autoReplyProgress}
				processedEmails={processedEmails}
				totalUnreadEmails={totalUnreadEmails}
				autoReplyLogs={autoReplyLogs}
				onStartAutoReply={onStartAutoReply}
				onStopAutoReply={onStopAutoReply}
			/>

			<RecentActivitySection recentEmails={recentEmails} />
		</div>
	);
}
