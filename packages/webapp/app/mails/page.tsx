"use client";

import DashboardTab from "@/components/dashboard/tabs/DashboardTab";
import DatabaseTab from "@/components/dashboard/tabs/DatabaseTab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDashboard } from "@/hooks/useDashboard";

export default function MailsPage() {
	const { activeTab, setActiveTab } = useDashboard();

	return (
		<div className="container mx-auto px-4 py-6">
			{/* Main Content */}
			<div className="lg:col-span-3">
				<Tabs
					value={activeTab}
					onValueChange={setActiveTab}
					className="space-y-6"
				>
					<TabsList className="grid w-full grid-cols-2">
						<TabsTrigger value="dashboard">대시보드</TabsTrigger>
						<TabsTrigger value="database">데이터베이스</TabsTrigger>
					</TabsList>

					<TabsContent value="dashboard">
						<DashboardTab />
					</TabsContent>

					<TabsContent value="database">
						<DatabaseTab />
					</TabsContent>
				</Tabs>
			</div>
		</div>
	);
}
