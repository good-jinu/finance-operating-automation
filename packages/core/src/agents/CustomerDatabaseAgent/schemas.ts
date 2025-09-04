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
	description: Annotation<string>({
		reducer: (x, y) => y ?? x,
		default: () => "",
	}),
});

export type CustomerDatabaseState =
	typeof CustomerDatabaseStateAnnotation.State;
