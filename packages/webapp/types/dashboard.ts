export interface FinOpsStats {
	authorityChange: number;
	accountChange: number;
	sealChange: number;
	pendingApproval: number;
}

export interface Email {
	id: number;
	sender: string;
	subject: string;
	preview: string;
	time: string;
	category: string;
	isAI: boolean;
}

export interface AutoReplyLog {
	id: string;
	subject: string;
	sender: string;
	status: "success" | "error" | "processing";
	timestamp: string;
	message?: string;
}

export interface AIGuideline {
	id: number;
	rule: string;
	active: boolean;
}

export interface AutoReplyProgress {
	totalEmails: number;
	processedEmails: number;
	status: "running" | "completed" | "error";
	currentEmail?: {
		subject: string;
		sender: string;
		status: "success" | "error" | "processing";
	};
}

export type TabValue =
	| "dashboard"
	| "inbox"
	| "sent"
	| "guidelines"
	| "database";
