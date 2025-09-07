"use client";

import { Clock, Mail, TrendingUp, Users } from "lucide-react";
import {
	Bar,
	BarChart,
	CartesianGrid,
	Cell,
	Legend,
	Pie,
	PieChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

// 샘플 데이터
const weeklyData = [
	{ date: "월", requests: 45, avgProcessTime: 12 },
	{ date: "화", requests: 52, avgProcessTime: 10 },
	{ date: "수", requests: 38, avgProcessTime: 15 },
	{ date: "목", requests: 61, avgProcessTime: 8 },
	{ date: "금", requests: 49, avgProcessTime: 11 },
];

const requestTypes = [
	{ name: "일반 문의", value: 35, color: "#6366f1" },
	{ name: "수권자 교체", value: 25, color: "#8b5cf6" },
	{ name: "계좌 교체", value: 20, color: "#06b6d4" },
	{ name: "서명인감 교체", value: 15, color: "#10b981" },
	{ name: "기타", value: 5, color: "#f59e0b" },
];

const HUMAN_HOURLY_CAPACITY = 3; // 인간 1명이 1시간에 처리할 수 있는 건수
const AGENT_HOURLY_CAPACITY = 9; // 에이전트가 1시간에 처리할 수 있는 건수
const EFFICIENCY_MULTIPLIER = AGENT_HOURLY_CAPACITY / HUMAN_HOURLY_CAPACITY; // 3배

const costSavingsData = weeklyData.map((day, index) => {
	const agentProcessed = day.requests;
	const humanEquivalent = Math.round(agentProcessed / EFFICIENCY_MULTIPLIER);
	const additionalCapacity = agentProcessed - humanEquivalent;

	// 누적 계산을 위한 이전 날들의 합계
	const cumulativeAgentProcessed = weeklyData
		.slice(0, index + 1)
		.reduce((sum, d) => sum + d.requests, 0);
	const cumulativeHumanEquivalent = Math.round(
		cumulativeAgentProcessed / EFFICIENCY_MULTIPLIER,
	);
	const cumulativeAdditionalCapacity =
		cumulativeAgentProcessed - cumulativeHumanEquivalent;

	return {
		date: day.date,
		agentProcessed,
		humanEquivalent,
		additionalCapacity,
		cumulativeAgentProcessed,
		cumulativeHumanEquivalent,
		cumulativeAdditionalCapacity,
		efficiencyMultiplier: EFFICIENCY_MULTIPLIER,
	};
});

export default function Dashboard() {
	const totalRequests = weeklyData.reduce((sum, day) => sum + day.requests, 0);
	const avgProcessTime = Math.round(
		weeklyData.reduce((sum, day) => sum + day.avgProcessTime, 0) /
			weeklyData.length,
	);

	const totalHumanEquivalent = Math.round(
		totalRequests / EFFICIENCY_MULTIPLIER,
	);
	const totalAdditionalCapacity = totalRequests - totalHumanEquivalent;
	const dailyAvgEfficiency =
		Math.round((totalRequests / 7 / (totalHumanEquivalent / 7)) * 100) / 100;

	return (
		<div className="min-h-screen bg-background p-6">
			<div className="max-w-7xl mx-auto space-y-6">
				{/* KPI 카드들 */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">
								총 요청 건수
							</CardTitle>
							<Mail className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold text-primary">
								{totalRequests}
							</div>
							<p className="text-xs text-muted-foreground">지난 7일간</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">
								평균 처리 시간
							</CardTitle>
							<Clock className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold text-primary">
								{avgProcessTime}분
							</div>
							<p className="text-xs text-muted-foreground">건당 평균</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">처리 효율성</CardTitle>
							<TrendingUp className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold text-accent">
								{dailyAvgEfficiency}배
							</div>
							<p className="text-xs text-muted-foreground">수작업 대비 일평균</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">
								수작업 절감 효과
							</CardTitle>
							<Users className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold text-accent">
								+{totalAdditionalCapacity}
							</div>
							<p className="text-xs text-muted-foreground">추가 처리 건수</p>
						</CardContent>
					</Card>
				</div>

				{/* 차트 섹션 */}
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
					{/* 일별 요청 현황 및 처리 시간 */}
					<Card>
						<CardHeader>
							<CardTitle>일별 요청 현황 및 평균 처리 시간</CardTitle>
							<CardDescription>
								지난 7일간 요청 건수와 건당 평균 처리 시간
							</CardDescription>
						</CardHeader>
						<CardContent>
							<ResponsiveContainer width="100%" height={300}>
								<BarChart data={weeklyData}>
									<CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
									<XAxis dataKey="date" stroke="#6b7280" />
									<YAxis yAxisId="left" stroke="#6b7280" />
									<YAxis yAxisId="right" orientation="right" stroke="#6b7280" />
									<Tooltip
										contentStyle={{
											backgroundColor: "white",
											border: "1px solid #e5e7eb",
											borderRadius: "8px",
											color: "#374151",
										}}
									/>
									<Bar
										yAxisId="left"
										dataKey="requests"
										fill="#6366f1"
										name="요청 건수"
									/>
									<Bar
										yAxisId="right"
										dataKey="avgProcessTime"
										fill="#8b5cf6"
										name="평균 처리시간(분)"
									/>
								</BarChart>
							</ResponsiveContainer>
						</CardContent>
					</Card>

					{/* 요청 유형별 분포 */}
					<Card>
						<CardHeader>
							<CardTitle>요청 유형별 분포</CardTitle>
							<CardDescription>전체 요청 중 유형별 비율</CardDescription>
						</CardHeader>
						<CardContent>
							<ResponsiveContainer width="100%" height={300}>
								<PieChart>
									<Pie
										data={requestTypes}
										cx="50%"
										cy="50%"
										labelLine={false}
										label={({ name, percent }) =>
											`${name} ${(percent * 100).toFixed(0)}%`
										}
										outerRadius={80}
										fill="#8884d8"
										dataKey="value"
									>
										{requestTypes.map((entry, index) => (
											<Cell key={`cell-${index}`} fill={entry.color} />
										))}
									</Pie>
									<Tooltip
										contentStyle={{
											backgroundColor: "white",
											border: "1px solid #e5e7eb",
											borderRadius: "8px",
											color: "#374151",
										}}
									/>
								</PieChart>
							</ResponsiveContainer>
						</CardContent>
					</Card>
				</div>

				{/* 누적 수작업 절감 효과 */}
				<Card>
					<CardHeader>
						<CardTitle>누적 수작업 절감 효과</CardTitle>
						<CardDescription>
							에이전트 vs 수작업 처리량 누적 비교 (수작업: 시간당{" "}
							{HUMAN_HOURLY_CAPACITY}건, 에이전트: 시간당{" "}
							{AGENT_HOURLY_CAPACITY}건 = {EFFICIENCY_MULTIPLIER}배 효율)
						</CardDescription>
					</CardHeader>
					<CardContent>
						<ResponsiveContainer width="100%" height={400}>
							<BarChart data={costSavingsData}>
								<CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
								<XAxis dataKey="date" stroke="#6b7280" />
								<YAxis stroke="#6b7280" />
								<Tooltip
									contentStyle={{
										backgroundColor: "white",
										border: "1px solid #e5e7eb",
										borderRadius: "8px",
										color: "#374151",
									}}
									formatter={(value, name) => {
										if (name === "수작업 상당 처리량")
											return [`${value}건`, name];
										if (name === "에이전트 추가 처리량")
											return [`+${value}건`, name];
										return [value, name];
									}}
								/>
								<Legend />
								<Bar
									dataKey="cumulativeHumanEquivalent"
									stackId="a"
									fill="#94a3b8"
									name="수작업 상당 처리량"
								/>
								<Bar
									dataKey="cumulativeAdditionalCapacity"
									stackId="a"
									fill="#6366f1"
									name="에이전트 추가 처리량"
								/>
							</BarChart>
						</ResponsiveContainer>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
