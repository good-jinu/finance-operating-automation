"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// Hook to fetch table names
export function useDatabaseTables() {
	return useQuery({
		queryKey: ["databaseTables"],
		queryFn: async () => {
			const res = await fetch("/api/database/tables");
			if (!res.ok) {
				throw new Error("Failed to fetch table names");
			}
			return res.json();
		},
	});
}

// Hook to fetch data for a specific table
export function useDatabaseTableData(tableName: string) {
	return useQuery({
		queryKey: ["databaseTableData", tableName],
		queryFn: async () => {
			if (!tableName) return [];
			const res = await fetch(`/api/database/${tableName}`);
			if (!res.ok) {
				throw new Error(`Failed to fetch data for table ${tableName}`);
			}
			return res.json();
		},
		enabled: !!tableName, // Only run query if tableName is not empty
	});
}

// Hook to fetch schema for a specific table
export function useDatabaseTableSchema(tableName: string) {
	return useQuery({
		queryKey: ["databaseTableSchema", tableName],
		queryFn: async () => {
			if (!tableName) return [];
			const res = await fetch(`/api/database/${tableName}/schema`);
			if (!res.ok) {
				throw new Error(`Failed to fetch schema for table ${tableName}`);
			}
			const schema = await res.json();
			return schema.filter(
				(col: any) =>
					col.name !== "id" &&
					col.name !== "created_at" &&
					col.name !== "updated_at",
			);
		},
		enabled: !!tableName,
	});
}

// Hook to create a new row
export function useCreateDatabaseRow(tableName: string) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (rowData: any) => {
			const res = await fetch(`/api/database/${tableName}`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(rowData),
			});
			if (!res.ok) {
				const errorData = await res.text();
				throw new Error(errorData || "Failed to create record");
			}
			return res.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["databaseTableData", tableName],
			});
		},
	});
}

// Hook to update a row
export function useUpdateDatabaseRow(tableName: string, rowId: string) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (rowData: any) => {
			const res = await fetch(`/api/database/${tableName}/${rowId}`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(rowData),
			});
			if (!res.ok) {
				const errorData = await res.text();
				throw new Error(errorData || "Failed to update record");
			}
			return res.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["databaseTableData", tableName],
			});
		},
	});
}

// Hook to delete a row
export function useDeleteDatabaseRow(tableName: string) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (rowId: string) => {
			const res = await fetch(`/api/database/${tableName}/${rowId}`, {
				method: "DELETE",
			});
			if (!res.ok) {
				const errorData = await res.text();
				throw new Error(errorData || "Failed to delete record");
			}
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["databaseTableData", tableName],
			});
		},
	});
}
