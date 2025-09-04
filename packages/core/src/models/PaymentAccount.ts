import db from "../database";

export interface PaymentAccount {
	id?: number;
	company_id: number;
	bank_name: string;
	account_number: string;
	account_holder: string;
	created_at?: string;
	updated_at?: string;
}

export function createPaymentAccount(
	account: Omit<PaymentAccount, "id" | "created_at" | "updated_at">,
): PaymentAccount {
	const stmt = db.prepare(`
		INSERT INTO payment_account (company_id, bank_name, account_number, account_holder)
		VALUES (?, ?, ?, ?)
	`);

	const result = stmt.run(
		account.company_id,
		account.bank_name,
		account.account_number,
		account.account_holder,
	);

	const lastInserted = findPaymentAccountById(result.lastInsertRowid as number);

	if (!lastInserted) {
		throw new Error("Failed to create payment account");
	}

	return lastInserted;
}

export function findPaymentAccountById(id: number): PaymentAccount | null {
	const stmt = db.prepare("SELECT * FROM payment_account WHERE id = ?");
	return stmt.get(id) as PaymentAccount | null;
}

export function findPaymentAccountByAccountNumber(account_number: string, company_id?: number): PaymentAccount | null {
	if (company_id) {
		const stmt = db.prepare("SELECT * FROM payment_account WHERE account_number = ? AND company_id = ?");
		return stmt.get(account_number, company_id) as PaymentAccount | null;
	} else {
		const stmt = db.prepare("SELECT * FROM payment_account WHERE account_number = ?");
		return stmt.get(account_number) as PaymentAccount | null;
	}
}

export function findPaymentAccountByAccountHolder(account_holder: string, company_id?: number): PaymentAccount | null {
	if (company_id) {
		const stmt = db.prepare("SELECT * FROM payment_account WHERE account_holder = ? AND company_id = ?");
		return stmt.get(account_holder, company_id) as PaymentAccount | null;
	} else {
		const stmt = db.prepare("SELECT * FROM payment_account WHERE account_holder = ?");
		return stmt.get(account_holder) as PaymentAccount | null;
	}
}

export function searchPaymentAccountsByBankName(bank_name: string, company_id?: number): PaymentAccount[] {
	if (company_id) {
		const stmt = db.prepare("SELECT * FROM payment_account WHERE bank_name LIKE ? AND company_id = ? ORDER BY created_at DESC");
		return stmt.all(`%${bank_name}%`, company_id) as PaymentAccount[];
	} else {
		const stmt = db.prepare("SELECT * FROM payment_account WHERE bank_name LIKE ? ORDER BY created_at DESC");
		return stmt.all(`%${bank_name}%`) as PaymentAccount[];
	}
}

export function findPaymentAccountsByCompanyId(company_id: number): PaymentAccount[] {
	const stmt = db.prepare("SELECT * FROM payment_account WHERE company_id = ? ORDER BY created_at DESC");
	return stmt.all(company_id) as PaymentAccount[];
}

export function findAllPaymentAccounts(): PaymentAccount[] {
	const stmt = db.prepare(
		"SELECT * FROM payment_account ORDER BY created_at DESC",
	);
	return stmt.all() as PaymentAccount[];
}

export function updatePaymentAccount(
	id: number,
	account: Partial<Omit<PaymentAccount, "id" | "created_at" | "updated_at">>,
): boolean {
	const fields = Object.keys(account)
		.map((key) => `${key} = ?`)
		.join(", ");
	const values = Object.values(account);

	if (fields.length === 0) {
		return false;
	}

	const stmt = db.prepare(`
		UPDATE payment_account
		SET ${fields}, updated_at = CURRENT_TIMESTAMP
		WHERE id = ?
	`);

	const result = stmt.run(...values, id);
	return result.changes > 0;
}

export function deletePaymentAccount(id: number): boolean {
	const stmt = db.prepare("DELETE FROM payment_account WHERE id = ?");
	const result = stmt.run(id);
	return result.changes > 0;
}
