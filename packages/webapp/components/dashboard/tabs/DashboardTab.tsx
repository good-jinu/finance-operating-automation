import type { AutoReplyLog, Email, FinOpsStats } from "@/types/dashboard";
import MailAndAutoReplySection from "../sections/MailAndAutoReplySection";
import RecentActivitySection from "../sections/RecentActivitySection";

interface DashboardTabProps {
	stats: FinOpsStats;
	recentEmails: Email[];
	isAutoReplyRunning: boolean;
	autoReplyLogs: AutoReplyLog[];
	onStartAutoReply: () => void;
	onStopAutoReply: () => void;
	isPending?: boolean;
	isSuccess?: boolean;
	isError?: boolean;
	error?: Error | null;
}

export default function DashboardTab({ recentEmails }: DashboardTabProps) {
	return (
		<div className="space-y-6">
			<MailAndAutoReplySection />

			<RecentActivitySection recentEmails={recentEmails} />
		</div>
	);
}
