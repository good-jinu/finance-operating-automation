import { Bot, Settings } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

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
	);
}
