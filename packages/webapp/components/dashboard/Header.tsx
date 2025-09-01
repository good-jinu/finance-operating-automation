import { Bot } from "lucide-react";

export default function Header() {
	return (
		<header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
			<div className="container mx-auto px-4 py-4">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-3">
						<div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
							<Bot className="w-5 h-5 text-primary-foreground" />
						</div>
						<h1 className="text-2xl font-bold text-foreground">
							금융기관 고객 정보 오퍼레이션 에이전트
						</h1>
					</div>
				</div>
			</div>
		</header>
	);
}
