"use client";

import { useEffect, useState } from "react";
import { useDatabaseTableSchema } from "@/hooks/useDatabase";
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
	const {
		data: formSchema,
		error,
		isLoading,
	} = useDatabaseTableSchema(tableName);

	useEffect(() => {
		if (initialData) {
			setFormData(initialData);
		} else if (formSchema) {
			const initialFormData = formSchema.reduce((acc: any, col: any) => {
				acc[col.name] = "";
				return acc;
			}, {});
			setFormData(initialFormData);
		}
	}, [initialData, formSchema]);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setFormData((prev: any) => ({ ...prev, [name]: value }));
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		onSubmit(formData);
	};

	const renderFormFields = () => {
		if (isLoading) return <p>Loading form...</p>;
		if (error) return <p>Error loading form.</p>;

		const fields = initialData
			? Object.keys(initialData).filter(
					(key) => key !== "id" && key !== "created_at" && key !== "updated_at",
				)
			: formSchema?.map((col: any) => col.name) || [];

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
		<Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
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
