import db from "../database";

export interface AuthorizedPerson {
	id?: number;
	company_id: number;
	name: string;
	email?: string;
	phone_number?: string;
	created_at?: string;
	updated_at?: string;
}

export function createAuthorizedPerson(
	person: Omit<AuthorizedPerson, "id" | "created_at" | "updated_at">,
): AuthorizedPerson {
	const stmt = db.prepare(`
		INSERT INTO authorized_person (company_id, name, email, phone_number)
		VALUES (?, ?, ?, ?)
	`);

	const result = stmt.run(
		person.company_id,
		person.name,
		person.email,
		person.phone_number,
	);

	const lastInserted = findAuthorizedPersonById(
		result.lastInsertRowid as number,
	);

	if (!lastInserted) {
		throw new Error("Failed to create authorized person");
	}

	return lastInserted;
}

export function findAuthorizedPersonById(id: number): AuthorizedPerson | null {
	const stmt = db.prepare("SELECT * FROM authorized_person WHERE id = ?");
	return stmt.get(id) as AuthorizedPerson | null;
}

export function findAuthorizedPersonByName(
	name: string,
	company_id?: number,
): AuthorizedPerson | null {
	if (company_id) {
		const stmt = db.prepare(
			"SELECT * FROM authorized_person WHERE name = ? AND company_id = ?",
		);
		return stmt.get(name, company_id) as AuthorizedPerson | null;
	} else {
		const stmt = db.prepare("SELECT * FROM authorized_person WHERE name = ?");
		return stmt.get(name) as AuthorizedPerson | null;
	}
}

export function searchAuthorizedPersonsByName(
	name: string,
	company_id?: number,
): AuthorizedPerson[] {
	if (company_id) {
		const stmt = db.prepare(
			"SELECT * FROM authorized_person WHERE name LIKE ? AND company_id = ? ORDER BY created_at DESC",
		);
		return stmt.all(`%${name}%`, company_id) as AuthorizedPerson[];
	} else {
		const stmt = db.prepare(
			"SELECT * FROM authorized_person WHERE name LIKE ? ORDER BY created_at DESC",
		);
		return stmt.all(`%${name}%`) as AuthorizedPerson[];
	}
}

export function findAuthorizedPersonsByCompanyId(
	company_id: number,
): AuthorizedPerson[] {
	const stmt = db.prepare(
		"SELECT * FROM authorized_person WHERE company_id = ? ORDER BY created_at DESC",
	);
	return stmt.all(company_id) as AuthorizedPerson[];
}

export function findAllAuthorizedPersons(): AuthorizedPerson[] {
	const stmt = db.prepare(
		"SELECT * FROM authorized_person ORDER BY created_at DESC",
	);
	return stmt.all() as AuthorizedPerson[];
}

export function updateAuthorizedPerson(
	id: number,
	person: Partial<Omit<AuthorizedPerson, "id" | "created_at" | "updated_at">>,
): boolean {
	const fields = Object.keys(person)
		.map((key) => `${key} = ?`)
		.join(", ");
	const values = Object.values(person);

	if (fields.length === 0) {
		return false;
	}

	const stmt = db.prepare(`
		UPDATE authorized_person
		SET ${fields}, updated_at = CURRENT_TIMESTAMP
		WHERE id = ?
	`);

	const result = stmt.run(...values, id);
	return result.changes > 0;
}

export function deleteAuthorizedPerson(id: number): boolean {
	const stmt = db.prepare("DELETE FROM authorized_person WHERE id = ?");
	const result = stmt.run(id);
	return result.changes > 0;
}
