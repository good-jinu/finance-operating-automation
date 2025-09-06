/**
 * 빌드 전 필요한 디렉토리들을 생성하는 스크립트
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// 생성해야 할 디렉토리들
const directories: string[] = [".storage", ".storage/files"];

// __dirname 대체 (ES 모듈에서)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function ensureDirectories(): void {
	console.log("🔧 필요한 디렉토리들을 확인하고 생성 중...");

	let createdCount: number = 0;

	for (const dir of directories) {
		const fullPath: string = path.join(__dirname, "..", dir);

		try {
			if (!fs.existsSync(fullPath)) {
				fs.mkdirSync(fullPath, { recursive: true });
				console.log(`✅ 디렉토리 생성됨: ${dir}`);
				createdCount++;
			} else {
				console.log(`📁 디렉토리 이미 존재함: ${dir}`);
			}
		} catch (error: unknown) {
			const errorMessage = error instanceof Error ? error.message : String(error);
			console.error(`❌ 디렉토리 생성 실패 (${dir}):`, errorMessage);
			process.exit(1);
		}
	}

	if (createdCount > 0) {
		console.log(`🎉 총 ${createdCount}개의 디렉토리가 생성되었습니다.`);
	} else {
		console.log("✨ 모든 디렉토리가 이미 존재합니다.");
	}
}

// 스크립트 실행
ensureDirectories();