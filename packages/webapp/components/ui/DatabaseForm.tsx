"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "./button";
import { Dialog, DialogContent, DialogFooter, DialogHeader } from "./dialog";
import { Input } from "./input";
import { Label } from "./label";

interface DatabaseFormProps {
	isOpen: boolean;
	onClose: () => void;
	onSubmit: (data: any) => void;
	initialData: any | null;
	tableName: string;
}

export function DatabaseForm({
	isOpen,
	onClose,
	onSubmit,
	initialData,
	tableName,
}: DatabaseFormProps) {
	const [formData, setFormData] = useState<any>({});
	const [formSchema, setFormSchema] = useState<any[]>([]);

	const fetchSchema = useCallback(async () => {
		if (!tableName) return;
		try {
			const res = await fetch(`/api/database/${tableName}/schema`);
			const schema = await res.json();
			const filteredSchema = schema.filter(
				(col: any) =>
					col.name !== "id" &&
					col.name !== "created_at" &&
					col.name !== "updated_at",
			);
			setFormSchema(filteredSchema);

			// Initialize form data for new entries
			if (!initialData) {
				const initialFormData = filteredSchema.reduce((acc: any, col: any) => {
					acc[col.name] = "";
					return acc;
				}, {});
				setFormData(initialFormData);
			}
		} catch (error) {
			console.error("Failed to fetch table schema:", error);
		}
	}, [tableName, initialData]);

	useEffect(() => {
		if (isOpen) {
			if (initialData) {
				setFormData(initialData);
			} else {
				fetchSchema();
			}
		}
	}, [initialData, isOpen, fetchSchema]);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setFormData((prev: any) => ({ ...prev, [name]: value }));
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		onSubmit(formData);
	};

	const renderFormFields = () => {
		const fields = initialData
			? Object.keys(initialData).filter(
					(key) => key !== "id" && key !== "created_at" && key !== "updated_at",
				)
			: formSchema.map((col) => col.name);

		return fields.map((key: string) => (
			<div key={key} className="grid grid-cols-4 items-center gap-4">
				<Label htmlFor={key} className="text-right">
					{key}
				</Label>
				<Input
					id={key}
					name={key}
					value={formData[key] || ""}
					onChange={handleChange}
					className="col-span-3"
				/>
			</div>
		));
	};

	return (
		<Dialog open={isOpen}>
			<DialogContent>
				<DialogHeader>
					{initialData ? "Edit" : "Create"} {tableName}
				</DialogHeader>
				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="grid gap-4 py-4">{renderFormFields()}</div>
					<DialogFooter>
						<Button type="button" variant="outline" onClick={onClose}>
							Cancel
						</Button>
						<Button type="submit">
							{initialData ? "Save Changes" : "Create"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
