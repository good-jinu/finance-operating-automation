"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
	useCreateDatabaseRow,
	useDatabaseTableData,
	useDatabaseTables,
	useDeleteDatabaseRow,
	useUpdateDatabaseRow,
} from "@/hooks/useDatabase";
import { Button } from "@/components/ui/button";
import { DatabaseForm } from "@/components/ui/DatabaseForm";
import { DataTable } from "@/components/ui/DataTable";
import { Toaster } from "@/components/ui/sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function DatabaseTab() {
	const [activeTable, setActiveTable] = useState<string>("");
	const [isFormOpen, setIsFormOpen] = useState(false);
	const [editingRow, setEditingRow] = useState<any | null>(null);

	const {
		data: tableNames,
		error: tablesError,
		isLoading: isLoadingTables,
	} = useDatabaseTables();

	const {
		data: tableData,
		error: tableDataError,
		isLoading: isLoadingTableData,
	} = useDatabaseTableData(activeTable);

	useEffect(() => {
		if (tableNames && tableNames.length > 0 && !activeTable) {
			setActiveTable(tableNames[0].name);
		}
	}, [tableNames, activeTable]);

	const createRowMutation = useCreateDatabaseRow(activeTable);
	const updateRowMutation = useUpdateDatabaseRow(
		activeTable,
		editingRow?.id || "",
	);
	const deleteRowMutation = useDeleteDatabaseRow(activeTable);

	const handleOpenForm = (row: any | null) => {
		setEditingRow(row);
		setIsFormOpen(true);
	};

	const handleCloseForm = () => {
		setEditingRow(null);
		setIsFormOpen(false);
	};

	const handleSubmitForm = async (data: any) => {
		const mutation = editingRow ? updateRowMutation : createRowMutation;
		try {
			await mutation.mutateAsync(data);
			toast.success(
				`Successfully ${editingRow ? "updated" : "created"} record.`,
			);
			handleCloseForm();
		} catch (error: any) {
			toast.error(`Error saving data: ${error.message}`);
		}
	};

	const handleDeleteRow = async (row: any) => {
		if (window.confirm("Are you sure you want to delete this record?")) {
			try {
				await deleteRowMutation.mutateAsync(row.id);
				toast.success("Successfully deleted record.");
			} catch (error: any) {
				toast.error(`Error deleting data: ${error.message}`);
			}
		}
	};

	if (isLoadingTables) return <p>Loading tables...</p>;
	if (tablesError) return <p>Error loading tables: {tablesError.message}</p>;

	return (
		<>
			<Toaster />
			<Tabs
				value={activeTable}
				onValueChange={setActiveTable}
				className="space-y-4"
			>
				<TabsList>
					{tableNames?.map((table: { name: string; label: string }) => (
						<TabsTrigger key={table.name} value={table.name}>
							{table.label}
						</TabsTrigger>
					))}
				</TabsList>
				{tableNames?.map((table: { name: string; label: string }) => (
					<TabsContent key={table.name} value={table.name}>
						<div className="flex justify-end mb-4">
							<Button onClick={() => handleOpenForm(null)}>Add New</Button>
						</div>
						{isLoadingTableData ? (
							<p>Loading...</p>
						) : tableDataError ? (
							<p>Error: {tableDataError.message}</p>
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
