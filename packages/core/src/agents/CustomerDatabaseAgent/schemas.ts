import type { BaseMessage } from "@langchain/core/messages";
import { Annotation } from "@langchain/langgraph";
import { z } from "zod";

export const AuthorizedPersonUpdateSchema = z.object({
	id: z.number(),
	name: z.string().optional(),
	email: z.string().optional(),
	phone_number: z.string().optional(),
});

export const PaymentAccountUpdateSchema = z.object({
	id: z.number(),
	bank_name: z.string().optional(),
	account_number: z.string().optional(),
	account_holder: z.string().optional(),
});

export const OfficialSealUpdateSchema = z.object({
	id: z.number(),
	file_path: z.string().optional(),
});

// 라우팅을 위한 스키마
export const RouteDecisionSchema = z.object({
	update_type: z
		.enum(["authorized_person", "payment_account", "official_seal"])
		.describe(
			"업데이트할 데이터의 유형. authorized_person: 수권자 정보 변경, payment_account: 결제계좌 정보 변경, official_seal: 인감/서명 정보 변경",
		),
	company_name: z.string().describe("변경 대상이 되는 회사명"),
});

// 수권자 분석을 위한 스키마
export const AuthorizedPersonAnalysisSchema = z
	.object({
		name: z.string().describe("이전 수권자의 이름"),
		update_data: z
			.object({
				name: z.string().optional().describe("새로운 수권자 이름"),
				email: z.email().optional().describe("새로운 이메일 주소"),
				phone_number: z
					.string()
					.optional()
					.describe("새로운 전화번호 (하이픈 포함 가능)"),
			})
			.describe("변경할 수권자 정보 필드들"),
	})
	.describe("수권자 정보 변경 요청을 분석하여 수권자명과 변경할 데이터를 추출");

// 결제계좌 분석을 위한 스키마
export const PaymentAccountAnalysisSchema = z
	.object({
		search_criteria: z
			.object({
				account_number: z
					.string()
					.optional()
					.describe("기존 계좌번호 (검색용)"),
				account_holder: z
					.string()
					.optional()
					.describe("기존 예금주명 (검색용)"),
				bank_name: z.string().optional().describe("기존 은행명 (검색용)"),
			})
			.describe("기존 결제계좌를 찾기 위한 검색 조건 (최소 하나 이상 필요)"),
		update_data: z
			.object({
				bank_name: z.string().optional().describe("새로운 은행명"),
				account_number: z.string().optional().describe("새로운 계좌번호"),
				account_holder: z.string().optional().describe("새로운 예금주명"),
			})
			.describe("변경할 결제계좌 정보 필드들"),
	})
	.describe(
		"결제계좌 정보 변경 요청을 분석하여 검색 조건과 변경할 데이터를 추출",
	);

// 인감/서명 분석을 위한 스키마
export const OfficialSealAnalysisSchema = z
	.object({
		update_data: z
			.object({
				file_path: z
					.string()
					.optional()
					.describe("새로운 인감/서명 파일의 경로"),
			})
			.describe("변경할 인감/서명 정보 필드들"),
	})
	.describe("인감/서명 정보 변경 요청을 분석하여 변경할 데이터를 추출");

// RouterState와 호환되는 Annotation 방식으로 변경
export const CustomerDatabaseStateAnnotation = Annotation.Root({
	messages: Annotation<BaseMessage[]>({
		reducer: (a, b) => a.concat(b),
		default: () => [],
	}),
	content: Annotation<string>({
		reducer: (_, y) => y,
		default: () => "",
	}),
	update_type: Annotation<string>({
		reducer: (_, y) => y,
		default: () => "",
	}),
	update_data: Annotation<any>({
		reducer: (_, y) => y,
		default: () => null,
	}),
	search_criteria: Annotation<any>({
		reducer: (_, y) => y,
		default: () => null,
	}),
	description: Annotation<string>({
		reducer: (x, y) => y ?? x,
		default: () => "",
	}),
});

export type CustomerDatabaseState =
	typeof CustomerDatabaseStateAnnotation.State;
