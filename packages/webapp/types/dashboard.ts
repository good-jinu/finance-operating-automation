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

export interface AIGuideline {
	id: number;
	rule: string;
	active: boolean;
}

export type TabValue = "dashboard" | "database";
