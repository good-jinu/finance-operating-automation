import { beforeEach, describe, expect, it, vi } from "vitest";
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
import {
	createTableRow,
	deleteTableRow,
	getTableData,
	getTableNames,
	getTableSchema,
	updateTableRow,
} from "./databaseService";

vi.mock("../database", () => ({
	default: {
		prepare: vi.fn(() => ({
			all: vi.fn(() => [{ name: "id", type: "INTEGER" }]),
			run: vi.fn(() => ({ changes: 1, lastInsertRowid: 1 })),
			get: vi.fn(() => ({ id: 1, name: "test" })),
		})),
	},
}));

vi.mock("../models/CustomerCompany");
vi.mock("../models/Customer");
vi.mock("../models/AuthorizedPerson");
vi.mock("../models/PaymentAccount");
vi.mock("../models/OfficialSeal");

describe("databaseService", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("getTableData", () => {
		it("should call the correct findAll function based on table name", async () => {
			await getTableData("customers_company");
			expect(findAllCustomerCompanies).toHaveBeenCalled();
			await getTableData("customers");
			expect(findAllCustomers).toHaveBeenCalled();
			await getTableData("authorized_person");
			expect(findAllAuthorizedPersons).toHaveBeenCalled();
			await getTableData("payment_account");
			expect(findAllPaymentAccounts).toHaveBeenCalled();
			await getTableData("official_seal");
			expect(findAllOfficialSeals).toHaveBeenCalled();
		});

		it("should return an empty array for an invalid table name", async () => {
			const result = await getTableData("invalid_table");
			expect(result).toEqual([]);
		});
	});

	describe("getTableNames", () => {
		it("should return a list of table names with labels", () => {
			const result = getTableNames();
			expect(result).toEqual([
				{ name: "customers_company", label: "고객사" },
				{ name: "customers", label: "고객" },
				{ name: "authorized_person", label: "승인된 직원" },
				{ name: "payment_account", label: "결제 계좌" },
				{ name: "official_seal", label: "직인" },
			]);
		});
	});

	describe("createTableRow", () => {
		it("should call the correct create function based on table name", async () => {
			const data = { name: "test" };
			await createTableRow("customers_company", data);
			expect(createCustomerCompany).toHaveBeenCalledWith(data);
			await createTableRow("customers", data);
			expect(createCustomer).toHaveBeenCalledWith(data);
			await createTableRow("authorized_person", data);
			expect(createAuthorizedPerson).toHaveBeenCalledWith(data);
			await createTableRow("payment_account", data);
			expect(createPaymentAccount).toHaveBeenCalledWith(data);
			await createTableRow("official_seal", data);
			expect(createOfficialSeal).toHaveBeenCalledWith(data);
		});

		it("should throw an error for an invalid table name", async () => {
			await expect(createTableRow("invalid_table", {})).rejects.toThrow(
				"Invalid table name for creation: invalid_table",
			);
		});
	});

	describe("updateTableRow", () => {
		it("should call the correct update function based on table name", async () => {
			const data = { name: "test" };
			await updateTableRow("customers_company", 1, data);
			expect(updateCustomerCompany).toHaveBeenCalledWith(1, data);
			await updateTableRow("customers", 1, data);
			expect(updateCustomer).toHaveBeenCalledWith(1, data);
			await updateTableRow("authorized_person", 1, data);
			expect(updateAuthorizedPerson).toHaveBeenCalledWith(1, data);
			await updateTableRow("payment_account", 1, data);
			expect(updatePaymentAccount).toHaveBeenCalledWith(1, data);
			await updateTableRow("official_seal", 1, data);
			expect(updateOfficialSeal).toHaveBeenCalledWith(1, data);
		});

		it("should throw an error for an invalid table name", async () => {
			await expect(updateTableRow("invalid_table", 1, {})).rejects.toThrow(
				"Invalid table name for update: invalid_table",
			);
		});
	});

	describe("deleteTableRow", () => {
		it("should call the correct delete function based on table name", async () => {
			await deleteTableRow("customers_company", 1);
			expect(deleteCustomerCompany).toHaveBeenCalledWith(1);
			await deleteTableRow("customers", 1);
			expect(deleteCustomer).toHaveBeenCalledWith(1);
			await deleteTableRow("authorized_person", 1);
			expect(deleteAuthorizedPerson).toHaveBeenCalledWith(1);
			await deleteTableRow("payment_account", 1);
			expect(deletePaymentAccount).toHaveBeenCalledWith(1);
			await deleteTableRow("official_seal", 1);
			expect(deleteOfficialSeal).toHaveBeenCalledWith(1);
		});

		it("should throw an error for an invalid table name", async () => {
			await expect(deleteTableRow("invalid_table", 1)).rejects.toThrow(
				"Invalid table name for deletion: invalid_table",
			);
		});
	});

	describe("getTableSchema", () => {
		it("should return the table schema", () => {
			const result = getTableSchema("any_table");
			expect(result).toEqual([{ name: "id", type: "INTEGER" }]);
		});
	});
});
