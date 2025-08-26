"use client";

import {
	AlertCircle,
	Archive,
	Bot,
	CheckCircle,
	Clock,
	Filter,
	MessageSquare,
	Plus,
	Search,
	Send,
	Settings,
	Star,
	TrendingUp,
	Users,
} from "lucide-react";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

export default function AIEmailDashboard() {
	const [activeTab, setActiveTab] = useState("dashboard");
	const [chatMessage, setChatMessage] = useState("");
	const [guideline, setGuideline] = useState("");

	const finOpsStats = {
		authorityChange: 23,
		accountChange: 18,
		sealChange: 15,
		pendingApproval: 8,
	};

	const recentEmails = [
		{
			id: 1,
			sender: "김철수 (ABC기업)",
			subject: "법인 수권자 변경 신청",
			preview:
				"AI 요약: 대표이사 변경에 따른 수권자 변경 신청서 및 필요 서류 제출",
			time: "2분 전",
			category: "수권자 변경",
			isAI: false,
		},
		{
			id: 2,
			sender: "이영희 (DEF상사)",
			subject: "자동이체 계좌 변경 요청",
			preview: "AI 요약: 월 결제계좌를 국민은행에서 신한은행으로 변경 요청",
			time: "15분 전",
			category: "계좌 변경",
			isAI: false,
		},
		{
			id: 3,
			sender: "AI FinOps 어시스턴트",
			subject: "자동 처리: 인감 변경 승인 완료",
			preview:
				"GHI corporation 인감 변경 신청이 가이드라인에 따라 자동 승인되었습니다.",
			time: "1시간 전",
			category: "AI 처리",
			isAI: true,
		},
		{
			id: 4,
			sender: "박민수 (JKL기업)",
			subject: "인감증명서 재발급 신청",
			preview:
				"AI 요약: 기존 인감 분실로 인한 신규 인감 등록 및 증명서 재발급 요청",
			time: "2시간 전",
			category: "인감 변경",
			isAI: false,
		},
	];

	const aiGuidelines = [
		{
			id: 1,
			rule: "수권자 변경 신청 시 필수 서류 체크 후 자동 안내",
			active: true,
		},
		{ id: 2, rule: "계좌 변경 요청 시 기존 계좌 잔액 확인 안내", active: true },
		{
			id: 3,
			rule: "인감 변경 신청 시 법인등기부등본 최신본 요구",
			active: false,
		},
		{
			id: 4,
			rule: "고액 거래 관련 문의 시 관리자에게 즉시 알림",
			active: true,
		},
	];

	return (
		<div className="min-h-screen bg-background">
			{/* Header */}
			<header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
				<div className="container mx-auto px-4 py-4">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-3">
							<div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
								<Bot className="w-5 h-5 text-primary-foreground" />
							</div>
							<h1 className="text-2xl font-bold text-foreground">
								FinOps - 금융 운영 자동화
							</h1>
						</div>
						<div className="flex items-center gap-2">
							<Button variant="outline" size="sm">
								<Settings className="w-4 h-4 mr-2" />
								설정
							</Button>
							<Avatar>
								<AvatarImage src="/user-avatar.jpg" />
								<AvatarFallback>관리자</AvatarFallback>
							</Avatar>
						</div>
					</div>
				</div>
			</header>

			<div className="container mx-auto px-4 py-6">
				<div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
					{/* Main Content */}
					<div className="lg:col-span-3">
						<Tabs
							value={activeTab}
							onValueChange={setActiveTab}
							className="space-y-6"
						>
							<TabsList className="grid w-full grid-cols-4">
								<TabsTrigger value="dashboard">대시보드</TabsTrigger>
								<TabsTrigger value="inbox">고객 요청</TabsTrigger>
								<TabsTrigger value="sent">처리 완료</TabsTrigger>
								<TabsTrigger value="guidelines">업무 규칙</TabsTrigger>
							</TabsList>

							{/* Dashboard Tab */}
							<TabsContent value="dashboard" className="space-y-6">
								{/* Stats Cards */}
								<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
									<Card>
										<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
											<CardTitle className="text-sm font-medium">
												수권자 변경
											</CardTitle>
											<Users className="h-4 w-4 text-muted-foreground" />
										</CardHeader>
										<CardContent>
											<div className="text-2xl font-bold">
												{finOpsStats.authorityChange}
											</div>
											<p className="text-xs text-muted-foreground">
												이번 달 처리
											</p>
										</CardContent>
									</Card>
									<Card>
										<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
											<CardTitle className="text-sm font-medium">
												계좌 변경
											</CardTitle>
											<TrendingUp className="h-4 w-4 text-muted-foreground" />
										</CardHeader>
										<CardContent>
											<div className="text-2xl font-bold">
												{finOpsStats.accountChange}
											</div>
											<p className="text-xs text-muted-foreground">
												이번 달 처리
											</p>
										</CardContent>
									</Card>
									<Card>
										<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
											<CardTitle className="text-sm font-medium">
												인감 변경
											</CardTitle>
											<CheckCircle className="h-4 w-4 text-muted-foreground" />
										</CardHeader>
										<CardContent>
											<div className="text-2xl font-bold">
												{finOpsStats.sealChange}
											</div>
											<p className="text-xs text-muted-foreground">
												이번 달 처리
											</p>
										</CardContent>
									</Card>
									<Card>
										<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
											<CardTitle className="text-sm font-medium">
												승인 대기
											</CardTitle>
											<Clock className="h-4 w-4 text-muted-foreground" />
										</CardHeader>
										<CardContent>
											<div className="text-2xl font-bold">
												{finOpsStats.pendingApproval}
											</div>
											<p className="text-xs text-muted-foreground">검토 필요</p>
										</CardContent>
									</Card>
								</div>

								{/* AI Activity Overview */}
								<Card>
									<CardHeader>
										<CardTitle className="flex items-center gap-2">
											<TrendingUp className="w-5 h-5" />
											FinOps 처리 현황
										</CardTitle>
										<CardDescription>
											AI가 처리한 금융 업무들을 확인하세요
										</CardDescription>
									</CardHeader>
									<CardContent>
										<div className="space-y-4">
											<div className="flex items-center justify-between">
												<span className="text-sm">서류 검증 자동화</span>
												<div className="flex items-center gap-2">
													<Progress value={94} className="w-20" />
													<span className="text-sm text-muted-foreground">
														94%
													</span>
												</div>
											</div>
											<div className="flex items-center justify-between">
												<span className="text-sm">업무 분류 정확도</span>
												<div className="flex items-center gap-2">
													<Progress value={89} className="w-20" />
													<span className="text-sm text-muted-foreground">
														89%
													</span>
												</div>
											</div>
											<div className="flex items-center justify-between">
												<span className="text-sm">자동 승인 처리</span>
												<div className="flex items-center gap-2">
													<Progress value={76} className="w-20" />
													<span className="text-sm text-muted-foreground">
														76%
													</span>
												</div>
											</div>
										</div>
									</CardContent>
								</Card>

								{/* Recent Activity */}
								<Card>
									<CardHeader>
										<CardTitle>최근 처리 내역</CardTitle>
										<CardDescription>
											AI가 최근에 처리한 금융 업무들
										</CardDescription>
									</CardHeader>
									<CardContent>
										<ScrollArea className="h-64">
											<div className="space-y-3">
												{recentEmails.map((email) => (
													<div
														key={email.id}
														className="flex items-start gap-3 p-3 rounded-lg border"
													>
														<Avatar className="w-8 h-8">
															<AvatarFallback>
																{email.sender.split(" ")[0][0]}
															</AvatarFallback>
														</Avatar>
														<div className="flex-1 min-w-0">
															<div className="flex items-center gap-2 mb-1">
																<p className="text-sm font-medium truncate">
																	{email.sender}
																</p>
																<Badge
																	variant={email.isAI ? "default" : "secondary"}
																	className="text-xs"
																>
																	{email.category}
																</Badge>
																<span className="text-xs text-muted-foreground ml-auto">
																	{email.time}
																</span>
															</div>
															<p className="text-sm text-foreground mb-1">
																{email.subject}
															</p>
															<p className="text-xs text-muted-foreground">
																{email.preview}
															</p>
														</div>
													</div>
												))}
											</div>
										</ScrollArea>
									</CardContent>
								</Card>
							</TabsContent>

							{/* Inbox Tab */}
							<TabsContent value="inbox" className="space-y-6">
								<div className="flex items-center justify-between">
									<h2 className="text-2xl font-bold">고객 요청 현황</h2>
									<div className="flex items-center gap-2">
										<Button variant="outline" size="sm">
											<Filter className="w-4 h-4 mr-2" />
											필터
										</Button>
										<div className="relative">
											<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
											<Input
												placeholder="메일 검색..."
												className="pl-10 w-64"
											/>
										</div>
									</div>
								</div>

								<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
									<Card className="cursor-pointer hover:shadow-md transition-shadow">
										<CardContent className="p-4">
											<div className="flex items-center gap-3">
												<div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
													<AlertCircle className="w-5 h-5 text-red-600" />
												</div>
												<div>
													<p className="font-medium">긴급 처리</p>
													<p className="text-sm text-muted-foreground">8개</p>
												</div>
											</div>
										</CardContent>
									</Card>
									<Card className="cursor-pointer hover:shadow-md transition-shadow">
										<CardContent className="p-4">
											<div className="flex items-center gap-3">
												<div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
													<Users className="w-5 h-5 text-blue-600" />
												</div>
												<div>
													<p className="font-medium">수권자 변경</p>
													<p className="text-sm text-muted-foreground">23개</p>
												</div>
											</div>
										</CardContent>
									</Card>
									<Card className="cursor-pointer hover:shadow-md transition-shadow">
										<CardContent className="p-4">
											<div className="flex items-center gap-3">
												<div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
													<CheckCircle className="w-5 h-5 text-green-600" />
												</div>
												<div>
													<p className="font-medium">자동 승인</p>
													<p className="text-sm text-muted-foreground">89개</p>
												</div>
											</div>
										</CardContent>
									</Card>
								</div>

								<Card>
									<CardContent className="p-0">
										<ScrollArea className="h-96">
											{recentEmails.map((email) => (
												<div
													key={email.id}
													className="flex items-center gap-4 p-4 border-b hover:bg-muted/50 cursor-pointer"
												>
													<Avatar>
														<AvatarFallback>{email.sender[0]}</AvatarFallback>
													</Avatar>
													<div className="flex-1 min-w-0">
														<div className="flex items-center gap-2 mb-1">
															<p className="font-medium">{email.sender}</p>
															<Badge
																variant={email.isAI ? "default" : "secondary"}
															>
																{email.category}
															</Badge>
														</div>
														<p className="text-sm text-foreground mb-1">
															{email.subject}
														</p>
														<p className="text-xs text-muted-foreground">
															{email.preview}
														</p>
													</div>
													<div className="flex items-center gap-2">
														<span className="text-xs text-muted-foreground">
															{email.time}
														</span>
														<Button variant="ghost" size="sm">
															<Star className="w-4 h-4" />
														</Button>
														<Button variant="ghost" size="sm">
															<Archive className="w-4 h-4" />
														</Button>
													</div>
												</div>
											))}
										</ScrollArea>
									</CardContent>
								</Card>
							</TabsContent>

							{/* Sent Tab */}
							<TabsContent value="sent" className="space-y-6">
								<div className="flex items-center justify-between">
									<h2 className="text-2xl font-bold">처리 완료 내역</h2>
									<Button>
										<Plus className="w-4 h-4 mr-2" />
										수동 처리
									</Button>
								</div>

								<Card>
									<CardContent className="p-0">
										<ScrollArea className="h-96">
											{recentEmails
												.filter((email) => email.isAI)
												.map((email) => (
													<div
														key={email.id}
														className="flex items-center gap-4 p-4 border-b hover:bg-muted/50 cursor-pointer"
													>
														<div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
															<Bot className="w-4 h-4 text-primary-foreground" />
														</div>
														<div className="flex-1 min-w-0">
															<div className="flex items-center gap-2 mb-1">
																<p className="font-medium">AI 어시스턴트</p>
																<Badge>AI가 보냄</Badge>
															</div>
															<p className="text-sm text-foreground mb-1">
																{email.subject}
															</p>
															<p className="text-xs text-muted-foreground">
																{email.preview}
															</p>
														</div>
														<div className="flex items-center gap-2">
															<span className="text-xs text-muted-foreground">
																{email.time}
															</span>
															<Button variant="ghost" size="sm">
																<MessageSquare className="w-4 h-4" />
															</Button>
														</div>
													</div>
												))}
										</ScrollArea>
									</CardContent>
								</Card>
							</TabsContent>

							{/* Guidelines Tab */}
							<TabsContent value="guidelines" className="space-y-6">
								<div className="flex items-center justify-between">
									<h2 className="text-2xl font-bold">FinOps 업무 규칙 설정</h2>
									<Button>
										<Plus className="w-4 h-4 mr-2" />새 규칙 추가
									</Button>
								</div>

								<Card>
									<CardHeader>
										<CardTitle>새 업무 규칙 만들기</CardTitle>
										<CardDescription>
											AI에게 금융 업무를 어떻게 처리할지 알려주세요
										</CardDescription>
									</CardHeader>
									<CardContent className="space-y-4">
										<Textarea
											placeholder="예: '수권자 변경 신청'이 접수되면, 법인등기부등본과 주주명부 최신본 요청 후 '필요 서류 안내드립니다. 법인등기부등본(3개월 이내)과 주주명부를 제출해 주세요.'라고 답장해줘"
											value={guideline}
											onChange={(e) => setGuideline(e.target.value)}
											className="min-h-20"
										/>
										<Button className="w-full">업무 규칙 저장</Button>
									</CardContent>
								</Card>

								<Card>
									<CardHeader>
										<CardTitle>활성 업무 규칙</CardTitle>
										<CardDescription>
											현재 적용 중인 FinOps 처리 규칙들
										</CardDescription>
									</CardHeader>
									<CardContent>
										<div className="space-y-3">
											{aiGuidelines.map((guideline) => (
												<div
													key={guideline.id}
													className="flex items-center justify-between p-3 border rounded-lg"
												>
													<span className="text-sm">{guideline.rule}</span>
													<div className="flex items-center gap-2">
														<Badge
															variant={
																guideline.active ? "default" : "secondary"
															}
														>
															{guideline.active ? "활성" : "비활성"}
														</Badge>
														<Button variant="ghost" size="sm">
															<Settings className="w-4 h-4" />
														</Button>
													</div>
												</div>
											))}
										</div>
									</CardContent>
								</Card>
							</TabsContent>
						</Tabs>
					</div>

					{/* AI Chatbot Sidebar */}
					<div className="lg:col-span-1">
						<Card className="sticky top-24">
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<Bot className="w-5 h-5" />
									FinOps AI 어시스턴트
								</CardTitle>
								<CardDescription>금융 업무 처리를 도와드립니다</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								<ScrollArea className="h-64 p-3 border rounded-lg">
									<div className="space-y-3">
										<div className="bg-muted p-3 rounded-lg">
											<p className="text-sm">
												안녕하세요! 오늘 수권자 변경 신청 2건, 계좌 변경 요청
												3건이 도착했습니다. 우선순위에 따라 처리해드릴까요?
											</p>
										</div>
										<div className="bg-primary text-primary-foreground p-3 rounded-lg ml-8">
											<p className="text-sm">네, 긴급한 것부터 처리해주세요.</p>
										</div>
										<div className="bg-muted p-3 rounded-lg">
											<p className="text-sm">
												ABC기업의 수권자 변경이 가장 긴급합니다. 필요 서류를
												확인하고 자동 안내 메일을 발송했습니다. DEF상사의
												계좌변경도 승인 대기 상태입니다.
											</p>
										</div>
									</div>
								</ScrollArea>

								<div className="space-y-2">
									<Input
										placeholder="메시지를 입력하세요..."
										value={chatMessage}
										onChange={(e) => setChatMessage(e.target.value)}
									/>
									<Button className="w-full">
										<Send className="w-4 h-4 mr-2" />
										전송
									</Button>
								</div>

								<div className="space-y-2">
									<p className="text-sm font-medium">빠른 작업</p>
									<div className="grid grid-cols-2 gap-2">
										<Button variant="outline" size="sm">
											수권자 변경
										</Button>
										<Button variant="outline" size="sm">
											계좌 변경
										</Button>
										<Button variant="outline" size="sm">
											인감 변경
										</Button>
										<Button variant="outline" size="sm">
											처리 현황
										</Button>
									</div>
								</div>
							</CardContent>
						</Card>
					</div>
				</div>
			</div>
		</div>
	);
}
