import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import type React from "react";
import "./globals.css";

const montserrat = Montserrat({
	subsets: ["latin"],
	display: "swap",
	variable: "--font-montserrat",
	weight: ["400", "600", "700", "900"],
});

export const metadata: Metadata = {
	title: "AI 이메일 매니저",
	description: "AI 기반 스마트 이메일 관리 시스템",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="ko">
			<body
				className={`font-sans ${GeistSans.variable} ${GeistMono.variable} ${montserrat.variable}`}
			>
				{children}
			</body>
		</html>
	);
}
