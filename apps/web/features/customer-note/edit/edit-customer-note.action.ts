"use server";

import { succeed } from "@harusame0616/result";
import {
  ADVICE_QUEUE_NAME,
  MEMORY_QUEUE_NAME,
} from "@workspace/db/queue-names";
import { updateTag } from "next/cache";
import { after } from "next/server";
import * as v from "valibot";
import { CustomerTag } from "@/features/customer/tag";
import { processMemoryQueue } from "@/features/customer-memory/process-memory-queue";
import { createServerAction } from "@/libs/create-server-action";
import { PgmqQueue } from "@/libs/queue";
import { processAdviceQueue } from "@/features/customer-note/advice/process-advice-queue";
import { editCustomerNote } from "./edit-customer-note";

const adviceQueue = new PgmqQueue<{ customerNoteId: string }>(
  ADVICE_QUEUE_NAME,
);
const memoryQueue = new PgmqQueue<{
  customerId: string;
  serviceNoteId: string;
}>(MEMORY_QUEUE_NAME);

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
  customerNoteId: v.pipe(v.string(), v.uuid()),
  keepImagePaths: v.optional(v.array(v.string()), []),
  serviceDate: v.pipe(
    v.string(),
    v.regex(/^\d{4}-\d{2}-\d{2}$/, "正しい日付形式で入力してください"),
  ),
  uploadImages: v.optional(v.array(uploadImageSchema), []),
});

export const editCustomerNoteAction = createServerAction(
  async (parameters, { role, userId }) => {
    const result = await editCustomerNote({
      ...parameters,
      user: { role, userId },
    });

    if (!result.success) {
      return result;
    }

    const customerId = result.data.customerId;

    await adviceQueue.sendMessage({
      customerNoteId: parameters.customerNoteId,
    });
    await memoryQueue.sendMessage({
      customerId,
      serviceNoteId: parameters.customerNoteId,
    });

    // トリガーはするがエラーのリトライなどはキューの定期処理で行うため、
    // 実行結果のハンドリングは不要
    after(async () => {
      await Promise.allSettled([processAdviceQueue(), processMemoryQueue()]);
    });

    return succeed({ customerId });
  },
  {
    name: "editCustomerNoteAction",
    onSuccess: ({ result }) => {
      updateTag(CustomerTag.NotesByCustomerId(result.customerId));
    },
    schema: editCustomerNoteSchema,
  },
);
