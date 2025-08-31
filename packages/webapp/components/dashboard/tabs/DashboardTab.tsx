import type { Email } from "@/types/dashboard";
import MailAndAutoReplySection from "../sections/MailAndAutoReplySection";
import RecentActivitySection from "../sections/RecentActivitySection";

interface DashboardTabProps {
	recentEmails: Email[];
}

export default function DashboardTab({ recentEmails }: DashboardTabProps) {
	return (
		<div className="space-y-6">
			<MailAndAutoReplySection />

			<RecentActivitySection recentEmails={recentEmails} />
		</div>
	);
}
