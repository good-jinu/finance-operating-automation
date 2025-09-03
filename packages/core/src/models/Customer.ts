import db from "../database";

export interface Customer {
	id?: number;
	name: string;
	email: string;
	company_id?: number;
	created_at?: string;
	updated_at?: string;
}

export function createCustomer(
	customer: Omit<Customer, "id" | "created_at" | "updated_at">,
): Customer {
	const stmt = db.prepare(`
		INSERT INTO customers (name, email, company_id)
		VALUES (?, ?, ?)
	`);

	const result = stmt.run(customer.name, customer.email, customer.company_id);

	const lastInserted = findCustomerById(result.lastInsertRowid as number);

	if (!lastInserted) {
		throw new Error("Failed to create customer");
	}

	return lastInserted;
}

export function findCustomerById(id: number): Customer | null {
	const stmt = db.prepare("SELECT * FROM customers WHERE id = ?");
	return stmt.get(id) as Customer | null;
}

export function findAllCustomers(): Customer[] {
	const stmt = db.prepare("SELECT * FROM customers ORDER BY created_at DESC");
	return stmt.all() as Customer[];
}

export function updateCustomer(
	id: number,
	customer: Partial<Omit<Customer, "id" | "created_at" | "updated_at">>,
): boolean {
	const fields = Object.keys(customer)
		.map((key) => `${key} = ?`)
		.join(", ");
	const values = Object.values(customer);

	if (fields.length === 0) {
		return false;
	}

	const stmt = db.prepare(`
		UPDATE customers
		SET ${fields}, updated_at = CURRENT_TIMESTAMP
		WHERE id = ?
	`);

	const result = stmt.run(...values, id);
	return result.changes > 0;
}

export function deleteCustomer(id: number): boolean {
	const stmt = db.prepare("DELETE FROM customers WHERE id = ?");
	const result = stmt.run(id);
	return result.changes > 0;
}
