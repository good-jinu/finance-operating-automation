"use client";

import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Button } from "./button";

interface DataTableProps {
	data: any[];
	onEdit: (row: any) => void;
	onDelete: (row: any) => void;
}

export function DataTable({ data, onEdit, onDelete }: DataTableProps) {
	if (!data || data.length === 0) {
		return <p>No data available.</p>;
	}

	const headers = Object.keys(data[0] as object);

	return (
		<Table>
			<TableHeader>
				<TableRow>
					{headers.map((header) => (
						<TableHead key={header}>{header}</TableHead>
					))}
					<TableHead>Actions</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{data.map((row, index) => (
					<TableRow key={index}>
						{headers.map((header) => (
							<TableCell key={header}>{String(row[header])}</TableCell>
						))}
						<TableCell>
							<Button
								variant="outline"
								size="sm"
								onClick={() => onEdit(row)}
								className="mr-2"
							>
								Edit
							</Button>
							<Button
								variant="destructive"
								size="sm"
								onClick={() => onDelete(row)}
							>
								Delete
							</Button>
						</TableCell>
					</TableRow>
				))}
			</TableBody>
		</Table>
	);
}
