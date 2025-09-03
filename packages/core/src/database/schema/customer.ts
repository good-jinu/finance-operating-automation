import type { Database } from "better-sqlite3";

export const createCustomerTables = (db: Database) => {
	// 회사 테이블
	db.exec(`
		CREATE TABLE IF NOT EXISTS customers_company
		(
			id         INTEGER PRIMARY KEY AUTOINCREMENT,
			name       TEXT NOT NULL,
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
			updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
		)
	`);

	// 고객 테이블
	db.exec(`
		CREATE TABLE IF NOT EXISTS customers
		(
			id         INTEGER PRIMARY KEY AUTOINCREMENT,
			name       TEXT NOT NULL,
			email      TEXT UNIQUE NOT NULL,
			company_id INTEGER,
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
			updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
			FOREIGN KEY (company_id) REFERENCES customers_company (id)
		)
	`);

	// 수권자 테이블
	db.exec(`
		CREATE TABLE IF NOT EXISTS authorized_person
		(
			id           INTEGER PRIMARY KEY AUTOINCREMENT,
			company_id   INTEGER NOT NULL,
			name         TEXT    NOT NULL,
			email        TEXT,
			phone_number TEXT,
			created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
			updated_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
			FOREIGN KEY (company_id) REFERENCES customers_company (id) ON DELETE CASCADE
		)
	`);

	// 결제계좌 테이블
	db.exec(`
		CREATE TABLE IF NOT EXISTS payment_account
		(
			id             INTEGER PRIMARY KEY AUTOINCREMENT,
			company_id     INTEGER NOT NULL,
			bank_name      TEXT    NOT NULL,
			account_number TEXT    NOT NULL,
			account_holder TEXT    NOT NULL,
			created_at     DATETIME DEFAULT CURRENT_TIMESTAMP,
			updated_at     DATETIME DEFAULT CURRENT_TIMESTAMP,
			FOREIGN KEY (company_id) REFERENCES customers_company (id) ON DELETE CASCADE
		)
	`);

	// 서명/인감 테이블
	db.exec(`
		CREATE TABLE IF NOT EXISTS official_seal
		(
			id         INTEGER PRIMARY KEY AUTOINCREMENT,
			company_id INTEGER NOT NULL,
			file_path  TEXT    NOT NULL,
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
			updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
			FOREIGN KEY (company_id) REFERENCES customers_company (id) ON DELETE CASCADE
		)
	`);
};
