"use server";

import { succeed } from "@harusame0616/result";
import { db } from "@workspace/db/client";
import { ADVICE_QUEUE_NAME } from "@workspace/db/queue-names";
import { sql } from "drizzle-orm";
import { updateTag } from "next/cache";
import * as v from "valibot";
import { CustomerTag } from "@/features/customer/tag";
import { createServerAction } from "@/libs/create-server-action";
import { editCustomerNote } from "./edit-customer-note";

const uploadImageSchema = v.object({
	permanentPath: v.string(),
	temporaryPath: v.string(),
});

const editCustomerNoteSchema = v.object({
	content: v.pipe(
		v.string(),
		v.minLength(1, "内容を入力してください"),
		v.maxLength(4096, "内容は4096文字以内で入力してください"),
	),
	keepImagePaths: v.optional(v.array(v.string()), []),
	noteId: v.pipe(v.string(), v.uuid()),
	serviceDate: v.pipe(
		v.string(),
		v.regex(/^\d{4}-\d{2}-\d{2}$/, "正しい日付形式で入力してください"),
	),
	uploadImages: v.optional(v.array(uploadImageSchema), []),
});

export const editCustomerNoteAction = createServerAction(
	async (
		{ content, keepImagePaths, noteId, serviceDate, uploadImages },
		{ role, userId },
	) => {
		// biome-ignore lint/style/noNonNullAssertion: isPublic: false のため認証済みで非null
		const user = { role: role!, userId: userId! };
		const result = await editCustomerNote({
			content,
			customerNoteId: noteId,
			keepImagePaths,
			serviceDate,
			uploadImages,
			user,
		});

		if (!result.success) {
			return result;
		}

		await db.execute(sql`
			SELECT pgmq.send(
				${ADVICE_QUEUE_NAME},
				${JSON.stringify({ customerNoteId: noteId })}::jsonb
			)
		`);

		return succeed({ customerId: result.data.customerId });
	},
	{
		name: "editCustomerNoteAction",
		onSuccess: ({ result }) => {
			updateTag(CustomerTag.NoteCrud(result.customerId));
		},
		schema: editCustomerNoteSchema,
	},
);
