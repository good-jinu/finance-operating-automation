import { join, dirname } from "node:path";
import { mkdirSync, existsSync } from "node:fs";
import Database from "better-sqlite3";
import { DATABASE_PATH } from "../utils/config";
import { createChatTables } from "./schema/chat";
import { createCustomerTables } from "./schema/customer";
import { createMailTables } from "./schema/mail";

const dbPath = join(process.cwd(), DATABASE_PATH);

// 데이터베이스 디렉토리가 존재하지 않으면 생성
const dbDir = dirname(dbPath);
if (!existsSync(dbDir)) {
	mkdirSync(dbDir, { recursive: true });
	console.log(`데이터베이스 디렉토리 생성: ${dbDir}`);
}

const db = new Database(dbPath);

// 데이터베이스 테이블 초기화
const initializeDatabase = () => {
	createMailTables(db);
	createChatTables(db);
	createCustomerTables(db);
};

// 데모 데이터 생성 함수 (동적 import 사용)
const seedDemoDataIfNeeded = async () => {
	try {
		// 고객사 테이블이 비어있는지 확인
		const stmt = db.prepare("SELECT COUNT(*) as count FROM customers_company");
		const result = stmt.get() as { count: number };
		
		if (result.count === 0) {
			console.log("빈 데이터베이스 감지 - 데모 데이터를 생성합니다...");
			
			// 동적 import로 seedDemoData 스크립트 로드
			const { seedAllDemoData } = await import("../scripts/seedDemoData");
			await seedAllDemoData();
			
			console.log("데모 데이터 생성 완료!");
		}
	} catch (error) {
		console.error("데모 데이터 생성 중 오류:", error);
		// 데모 데이터 생성 실패는 DB 초기화를 방해하지 않음
	}
};

// 데이터베이스 초기화 실행
initializeDatabase();

// 데모 데이터 생성 (비동기)
seedDemoDataIfNeeded();

export default db;
export { initializeDatabase, seedDemoDataIfNeeded };
