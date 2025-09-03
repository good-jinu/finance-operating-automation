import { useState } from "react";
import type { TabValue } from "@/types/dashboard";

export function useDashboard() {
	const [activeTab, setActiveTab] = useState<TabValue>("dashboard");

	return {
		activeTab,
		setActiveTab: (value: string) => {
			switch (value) {
				case "dashboard":
					setActiveTab("dashboard");
					break;
				case "database":
					setActiveTab("database");
					break;
			}
		},
	};
}
