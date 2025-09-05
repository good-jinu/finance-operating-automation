import db from "../database";

export interface OfficialSeal {
	id?: number;
	company_id: number;
	file_path: string;
	created_at?: string;
	updated_at?: string;
}

export function createOfficialSeal(
	seal: Omit<OfficialSeal, "id" | "created_at" | "updated_at">,
): OfficialSeal {
	const stmt = db.prepare(`
		INSERT INTO official_seal (company_id, file_path)
		VALUES (?, ?)
	`);

	const result = stmt.run(seal.company_id, seal.file_path);

	const lastInserted = findOfficialSealById(result.lastInsertRowid as number);

	if (!lastInserted) {
		throw new Error("Failed to create official seal");
	}

	return lastInserted;
}

export function findOfficialSealById(id: number): OfficialSeal | null {
	const stmt = db.prepare("SELECT * FROM official_seal WHERE id = ?");
	return stmt.get(id) as OfficialSeal | null;
}

export function findOfficialSealsByCompanyId(
	company_id: number,
): OfficialSeal[] {
	const stmt = db.prepare(
		"SELECT * FROM official_seal WHERE company_id = ? ORDER BY created_at DESC",
	);
	return stmt.all(company_id) as OfficialSeal[];
}

export function findLatestOfficialSealByCompanyId(
	company_id: number,
): OfficialSeal | null {
	const stmt = db.prepare(
		"SELECT * FROM official_seal WHERE company_id = ? ORDER BY created_at DESC LIMIT 1",
	);
	return stmt.get(company_id) as OfficialSeal | null;
}

export function findAllOfficialSeals(): OfficialSeal[] {
	const stmt = db.prepare(
		"SELECT * FROM official_seal ORDER BY created_at DESC",
	);
	return stmt.all() as OfficialSeal[];
}

export function updateOfficialSeal(
	id: number,
	seal: Partial<Omit<OfficialSeal, "id" | "created_at" | "updated_at">>,
): boolean {
	const fields = Object.keys(seal)
		.map((key) => `${key} = ?`)
		.join(", ");
	const values = Object.values(seal);

	if (fields.length === 0) {
		return false;
	}

	const stmt = db.prepare(`
		UPDATE official_seal
		SET ${fields}, updated_at = CURRENT_TIMESTAMP
		WHERE id = ?
	`);

	const result = stmt.run(...values, id);
	return result.changes > 0;
}

export function deleteOfficialSeal(id: number): boolean {
	const stmt = db.prepare("DELETE FROM official_seal WHERE id = ?");
	const result = stmt.run(id);
	return result.changes > 0;
}
