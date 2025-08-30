import { CheckCircle, Clock, TrendingUp, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { FinOpsStats } from "@/types/dashboard";

interface StatsCardsProps {
	stats: FinOpsStats;
}

export default function StatsCards({ stats }: StatsCardsProps) {
	return (
		<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
			<Card>
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle className="text-sm font-medium">수권자 변경</CardTitle>
					<Users className="h-4 w-4 text-muted-foreground" />
				</CardHeader>
				<CardContent>
					<div className="text-2xl font-bold">{stats.authorityChange}</div>
					<p className="text-xs text-muted-foreground">이번 달 처리</p>
				</CardContent>
			</Card>
			<Card>
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle className="text-sm font-medium">계좌 변경</CardTitle>
					<TrendingUp className="h-4 w-4 text-muted-foreground" />
				</CardHeader>
				<CardContent>
					<div className="text-2xl font-bold">{stats.accountChange}</div>
					<p className="text-xs text-muted-foreground">이번 달 처리</p>
				</CardContent>
			</Card>
			<Card>
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle className="text-sm font-medium">인감 변경</CardTitle>
					<CheckCircle className="h-4 w-4 text-muted-foreground" />
				</CardHeader>
				<CardContent>
					<div className="text-2xl font-bold">{stats.sealChange}</div>
					<p className="text-xs text-muted-foreground">이번 달 처리</p>
				</CardContent>
			</Card>
			<Card>
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle className="text-sm font-medium">승인 대기</CardTitle>
					<Clock className="h-4 w-4 text-muted-foreground" />
				</CardHeader>
				<CardContent>
					<div className="text-2xl font-bold">{stats.pendingApproval}</div>
					<p className="text-xs text-muted-foreground">검토 필요</p>
				</CardContent>
			</Card>
		</div>
	);
}
