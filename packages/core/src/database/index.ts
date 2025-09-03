import { join } from "node:path";
import Database from "better-sqlite3";
import { DATABASE_PATH } from "../utils/config";
import { createChatTables } from "./schema/chat";
import { createCustomerTables } from "./schema/customer";
import { createMailTables } from "./schema/mail";

const dbPath = join(process.cwd(), DATABASE_PATH);
const db = new Database(dbPath);

// 데이터베이스 테이블 초기화
const initializeDatabase = () => {
	createMailTables(db);
	createChatTables(db);
	createCustomerTables(db);
};

// 데이터베이스 초기화 실행
initializeDatabase();

export default db;
export { initializeDatabase };
