"use client";

import type * as React from "react";
import { cn } from "@/lib/utils";

const Dialog = ({
	children,
	open,
}: {
	children: React.ReactNode;
	open: boolean;
}) => {
	if (!open) return null;
	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
			<div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
				{children}
			</div>
		</div>
	);
};

const DialogHeader = ({
	children,
	className,
}: {
	children: React.ReactNode;
	className?: string;
}) => (
	<div className={cn("text-lg font-semibold mb-4", className)}>{children}</div>
);

const DialogContent = ({
	children,
	className,
}: {
	children: React.ReactNode;
	className?: string;
}) => <div className={cn("mb-4", className)}>{children}</div>;

const DialogFooter = ({
	children,
	className,
}: {
	children: React.ReactNode;
	className?: string;
}) => (
	<div className={cn("flex justify-end space-x-2", className)}>{children}</div>
);

export { Dialog, DialogHeader, DialogContent, DialogFooter };
