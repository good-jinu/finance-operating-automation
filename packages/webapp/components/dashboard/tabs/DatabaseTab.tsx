"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { DatabaseForm } from "@/components/ui/DatabaseForm";
import { DataTable } from "@/components/ui/DataTable";
import { Toaster, toast } from "@/components/ui/sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function DatabaseTab() {
	const [tableNames, setTableNames] = useState<string[]>([]);
	const [activeTable, setActiveTable] = useState<string>("");
	const [tableData, setTableData] = useState<any[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [isFormOpen, setIsFormOpen] = useState(false);
	const [editingRow, setEditingRow] = useState<any | null>(null);

	const fetchTableData = useCallback(async () => {
		if (!activeTable) return;
		setIsLoading(true);
		try {
			const res = await fetch(`/api/database/${activeTable}`);
			const data = await res.json();
			setTableData(data);
		} catch (error) {
			console.error(`Failed to fetch data for table ${activeTable}:`, error);
			setTableData([]);
			toast.error("Failed to fetch data.");
		} finally {
			setIsLoading(false);
		}
	}, [activeTable]);

	useEffect(() => {
		async function fetchTableNames() {
			try {
				const res = await fetch("/api/database/tables");
				const names = await res.json();
				setTableNames(names);
				if (names.length > 0) {
					setActiveTable(names[0]);
				}
			} catch (error) {
				console.error("Failed to fetch table names:", error);
				toast.error("Failed to fetch table names.");
			}
		}
		fetchTableNames();
	}, []);

	useEffect(() => {
		fetchTableData();
	}, [fetchTableData]);

	const handleOpenForm = (row: any | null) => {
		setEditingRow(row);
		setIsFormOpen(true);
	};

	const handleCloseForm = () => {
		setEditingRow(null);
		setIsFormOpen(false);
	};

	const handleSubmitForm = async (data: any) => {
		try {
			const url = editingRow
				? `/api/database/${activeTable}/${editingRow.id}`
				: `/api/database/${activeTable}`;
			const method = editingRow ? "PUT" : "POST";

			const response = await fetch(url, {
				method,
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(data),
			});

			if (!response.ok) {
				const errorData = await response.text();
				throw new Error(errorData || "Failed to save data");
			}

			toast.success(
				`Successfully ${editingRow ? "updated" : "created"} record.`,
			);
			handleCloseForm();
			fetchTableData(); // Refresh data
		} catch (error: any) {
			console.error("Error saving data:", error);
			toast.error(`Error saving data: ${error.message}`);
		}
	};

	const handleDeleteRow = async (row: any) => {
		if (window.confirm("Are you sure you want to delete this record?")) {
			try {
				const response = await fetch(`/api/database/${activeTable}/${row.id}`, {
					method: "DELETE",
				});

				if (!response.ok) {
					const errorData = await response.text();
					throw new Error(errorData || "Failed to delete data");
				}

				toast.success("Successfully deleted record.");
				fetchTableData(); // Refresh data
			} catch (error: any) {
				console.error("Error deleting data:", error);
				toast.error(`Error deleting data: ${error.message}`);
			}
		}
	};

	return (
		<>
			<Toaster />
			<Tabs
				value={activeTable}
				onValueChange={setActiveTable}
				className="space-y-4"
			>
				<TabsList>
					{tableNames.map((name) => (
						<TabsTrigger key={name} value={name}>
							{name}
						</TabsTrigger>
					))}
				</TabsList>
				{tableNames.map((name) => (
					<TabsContent key={name} value={name}>
						<div className="flex justify-end mb-4">
							<Button onClick={() => handleOpenForm(null)}>Add New</Button>
						</div>
						{isLoading ? (
							<p>Loading...</p>
						) : (
							<DataTable
								data={tableData}
								onEdit={handleOpenForm}
								onDelete={handleDeleteRow}
							/>
						)}
					</TabsContent>
				))}
				<DatabaseForm
					isOpen={isFormOpen}
					onClose={handleCloseForm}
					onSubmit={handleSubmitForm}
					initialData={editingRow}
					tableName={activeTable}
				/>
			</Tabs>
		</>
	);
}
