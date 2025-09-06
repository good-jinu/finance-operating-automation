"use client";

import { Bot } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Header() {
	const pathname = usePathname();

	return (
		<header className="bg-sky-400/10 backdrop-blur-sm sticky top-0 z-50">
			<div className="container mx-auto px-4">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-3">
						<div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
							<Bot className="w-5 h-5 text-primary-foreground" />
						</div>
						<h1 className="text-2xl font-bold text-foreground">
							Client Operation Agent
						</h1>
					</div>
					<nav className="flex items-stretch gap-2 h-16 pt-2">
						<Link
							href="/mails"
							className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-colors flex items-center ${
								pathname === "/mails"
									? "bg-background dark:bg-background text-foreground"
									: "text-muted-foreground hover:text-foreground"
							}`}
						>
							메일함
						</Link>
						<Link
							href="/database"
							className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-colors flex items-center ${
								pathname === "/database"
									? "bg-background dark:bg-background text-foreground"
									: "text-muted-foreground hover:text-foreground"
							}`}
						>
							DB
						</Link>
						<Link
							href="/dashboard"
							className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-colors flex items-center ${
								pathname === "/dashboard"
									? "bg-background dark:bg-background text-foreground"
									: "text-muted-foreground hover:text-foreground"
							}`}
						>
							대시보드
						</Link>
					</nav>
				</div>
			</div>
		</header>
	);
}
