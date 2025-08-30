import type { GmailMessage } from "@finance-operating-automation/core/models";
import { useQuery } from "@tanstack/react-query";

interface MailListResponse {
	success: boolean;
	data: GmailMessage[];
}

export function useMails(isUnreadOnly: boolean = false) {
	return useQuery<MailListResponse>({
		queryKey: ["mails", isUnreadOnly],
		queryFn: async () => {
			const response = await fetch(`/api/mails?unreadOnly=${isUnreadOnly}`);
			if (!response.ok) {
				throw new Error("Failed to fetch mails");
			}
			return response.json();
		},
	});
}
