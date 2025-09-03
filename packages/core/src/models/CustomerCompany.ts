import db from "../database";

export interface CustomerCompany {
	id?: number;
	name: string;
	created_at?: string;
	updated_at?: string;
}

export function createCustomerCompany(
	company: Omit<CustomerCompany, "id" | "created_at" | "updated_at">,
): CustomerCompany {
	const stmt = db.prepare(`
		INSERT INTO customers_company (name)
		VALUES (?)
	`);

	const result = stmt.run(company.name);

	const lastInserted = findCustomerCompanyById(
		result.lastInsertRowid as number,
	);

	if (!lastInserted) {
		throw new Error("Failed to create company");
	}

	return lastInserted;
}

export function findCustomerCompanyById(id: number): CustomerCompany | null {
	const stmt = db.prepare("SELECT * FROM customers_company WHERE id = ?");
	return stmt.get(id) as CustomerCompany | null;
}

export function findAllCustomerCompanies(): CustomerCompany[] {
	const stmt = db.prepare(
		"SELECT * FROM customers_company ORDER BY created_at DESC",
	);
	return stmt.all() as CustomerCompany[];
}

export function updateCustomerCompany(
	id: number,
	company: Partial<Omit<CustomerCompany, "id" | "created_at" | "updated_at">>,
): boolean {
	const fields = Object.keys(company)
		.map((key) => `${key} = ?`)
		.join(", ");
	const values = Object.values(company);

	if (fields.length === 0) {
		return false;
	}

	const stmt = db.prepare(`
		UPDATE customers_company
		SET ${fields}, updated_at = CURRENT_TIMESTAMP
		WHERE id = ?
	`);

	const result = stmt.run(...values, id);
	return result.changes > 0;
}

export function deleteCustomerCompany(id: number): boolean {
	const stmt = db.prepare("DELETE FROM customers_company WHERE id = ?");
	const result = stmt.run(id);
	return result.changes > 0;
}
