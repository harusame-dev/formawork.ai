"use server";

import { updateTag } from "next/cache";
import { after } from "next/server";
import * as v from "valibot";
import { CustomerTag } from "@/features/customer/tag";
import { processMemoryQueue } from "@/features/customer-memory/process-memory-queue";
import { createServerAction } from "@/libs/create-server-action";
import { processAdviceQueue } from "../advice/process-advice-queue";
import { registerCustomerNote } from "./register-customer-note";

const uploadImageSchema = v.object({
	permanentPath: v.string(),
	temporaryPath: v.string(),
});

const registerCustomerNoteSchema = v.object({
	content: v.pipe(
		v.string(),
		v.minLength(1, "内容を入力してください"),
		v.maxLength(4096, "内容は4096文字以内で入力してください"),
	),
	customerId: v.pipe(v.string(), v.uuid()),
	serviceDate: v.pipe(
		v.string(),
		v.regex(/^\d{4}-\d{2}-\d{2}$/, "正しい日付形式で入力してください"),
	),
	uploadImages: v.optional(v.array(uploadImageSchema), []),
});

export const registerCustomerNoteAction = createServerAction(
	async (input, { userId }) => {
		const result = await registerCustomerNote({
			...input,
			staffId: userId,
		});

		if (!result.success) {
			return result;
		}

		// トリガーはするがエラーのリトライなどはキューの定期処理で行うため、
		// 実行結果のハンドリングは不要
		after(async () => {
			await Promise.allSettled([processAdviceQueue(), processMemoryQueue()]);
		});

		return result;
	},
	{
		name: "registerCustomerNoteAction",
		onSuccess: ({ input: { customerId } }) => {
			updateTag(CustomerTag.NotesByCustomerId(customerId));
		},
		schema: registerCustomerNoteSchema,
	},
);
