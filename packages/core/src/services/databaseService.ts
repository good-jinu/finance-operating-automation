import db from "../database";
import {
	createAuthorizedPerson,
	deleteAuthorizedPerson,
	findAllAuthorizedPersons,
	updateAuthorizedPerson,
} from "../models/AuthorizedPerson";
import {
	createCustomer,
	deleteCustomer,
	findAllCustomers,
	updateCustomer,
} from "../models/Customer";
import {
	createCustomerCompany,
	deleteCustomerCompany,
	findAllCustomerCompanies,
	updateCustomerCompany,
} from "../models/CustomerCompany";
import {
	createOfficialSeal,
	deleteOfficialSeal,
	findAllOfficialSeals,
	updateOfficialSeal,
} from "../models/OfficialSeal";
import {
	createPaymentAccount,
	deletePaymentAccount,
	findAllPaymentAccounts,
	updatePaymentAccount,
} from "../models/PaymentAccount";

export async function getTableData(tableName: string): Promise<unknown[]> {
	switch (tableName) {
		case "customers_company":
			return findAllCustomerCompanies();
		case "customers":
			return findAllCustomers();
		case "authorized_person":
			return findAllAuthorizedPersons();
		case "payment_account":
			return findAllPaymentAccounts();
		case "official_seal":
			return findAllOfficialSeals();
		default:
			return [];
	}
}

export function getTableNames(): string[] {
	return [
		"customers_company",
		"customers",
		"authorized_person",
		"payment_account",
		"official_seal",
	];
}

export async function createTableRow(
	tableName: string,
	data: any,
): Promise<unknown> {
	switch (tableName) {
		case "customers_company":
			return createCustomerCompany(data);
		case "customers":
			return createCustomer(data);
		case "authorized_person":
			return createAuthorizedPerson(data);
		case "payment_account":
			return createPaymentAccount(data);
		case "official_seal":
			return createOfficialSeal(data);
		default:
			throw new Error(`Invalid table name for creation: ${tableName}`);
	}
}

export async function updateTableRow(
	tableName: string,
	id: number,
	data: any,
): Promise<boolean> {
	switch (tableName) {
		case "customers_company":
			return updateCustomerCompany(id, data);
		case "customers":
			return updateCustomer(id, data);
		case "authorized_person":
			return updateAuthorizedPerson(id, data);
		case "payment_account":
			return updatePaymentAccount(id, data);
		case "official_seal":
			return updateOfficialSeal(id, data);
		default:
			throw new Error(`Invalid table name for update: ${tableName}`);
	}
}

export async function deleteTableRow(
	tableName: string,
	id: number,
): Promise<boolean> {
	switch (tableName) {
		case "customers_company":
			return deleteCustomerCompany(id);
		case "customers":
			return deleteCustomer(id);
		case "authorized_person":
			return deleteAuthorizedPerson(id);
		case "payment_account":
			return deletePaymentAccount(id);
		case "official_seal":
			return deleteOfficialSeal(id);
		default:
			throw new Error(`Invalid table name for deletion: ${tableName}`);
	}
}

export function getTableSchema(tableName: string): Promise<any[]> {
	const stmt = db.prepare(`PRAGMA table_info(${tableName})`);
	return stmt.all();
}
