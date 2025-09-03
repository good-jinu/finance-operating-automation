"use client";

import { useEffect, useState } from "react";
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

	useEffect(() => {
		if (initialData) {
			setFormData(initialData);
		} else {
			setFormData({});
		}
	}, [initialData]);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setFormData((prev: any) => ({ ...prev, [name]: value }));
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		onSubmit(formData);
	};

	const renderFormFields = () => {
		if (!initialData && !Object.keys(formData).length && !isOpen) return null;
		const data = initialData || formData;
		const fields = Object.keys(data).filter(
			(key) => key !== "id" && key !== "created_at" && key !== "updated_at",
		);

		return fields.map((key) => (
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
