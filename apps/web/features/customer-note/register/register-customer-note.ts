import { randomUUID } from "node:crypto";
import { type Result, succeed } from "@harusame0616/result";
import { getLogger } from "@repo/logger/nextjs/server";
import { createAdminClient } from "@repo/supabase/admin";
import { db } from "@workspace/db/client";
import {
  ADVICE_QUEUE_NAME,
  MEMORY_QUEUE_NAME,
} from "@workspace/db/queue-names";
import {
  customerNoteImagesTable,
  customerNotesTable,
} from "@workspace/db/schema/customer-note";
import { PgmqQueue } from "@/libs/queue";

const BUCKET_NAME = "customer-note-attachments";

type RegisterCustomerNoteErrorMessage =
  "サーバーエラーが発生しました。時間をおいて再度お試しください";

interface UploadImage {
  permanentPath: string;
  temporaryPath: string;
}

interface RegisterCustomerNoteInput {
  content: string;
  customerId: string;
  serviceDate: string;
  staffId: string;
  uploadImages: UploadImage[];
}

export async function registerCustomerNote({
  content,
  customerId,
  serviceDate,
  staffId,
  uploadImages,
}: RegisterCustomerNoteInput): Promise<
  Result<void, RegisterCustomerNoteErrorMessage>
> {
  const logger = await getLogger("registerCustomerNote");

  const noteId = randomUUID();
  const supabase = createAdminClient();

  await db.transaction(async (tx) => {
    await tx.insert(customerNotesTable).values({
      content,
      customerId,
      customerNoteId: noteId,
      serviceDate,
      staffId,
    });

    if (uploadImages.length > 0) {
      const moveResults = await Promise.all(
        uploadImages.map(async (uploadImage, index) => {
          const { permanentPath, temporaryPath } = uploadImage;

          const { error: moveError } = await supabase.storage
            .from(BUCKET_NAME)
            .move(temporaryPath, permanentPath);

          if (moveError) {
            logger.error("Failed to move image file", {
              displayOrder: index,
              err: moveError,
              permanentPath,
              temporaryPath,
            });
            throw new Error(`Failed to move image file: ${moveError.message}`);
          }

          return {
            displayOrder: index,
            path: permanentPath,
          };
        }),
      );

      await tx.insert(customerNoteImagesTable).values(
        moveResults.map((result) => ({
          customerNoteId: noteId,
          displayOrder: result.displayOrder,
          path: result.path,
        })),
      );
    }

    const adviceQueue = new PgmqQueue<{ customerNoteId: string }>(
      ADVICE_QUEUE_NAME,
      tx,
    );
    const memoryQueue = new PgmqQueue<{
      customerId: string;
      serviceNoteId: string;
    }>(MEMORY_QUEUE_NAME, tx);

    await adviceQueue.sendMessage({ customerNoteId: noteId });
    await memoryQueue.sendMessage({ customerId, serviceNoteId: noteId });
  });

  logger.info("顧客ノートの登録に成功", {
    action: "register-customer-note",
    customerId,
    imageCount: uploadImages.length,
    noteId,
  });

  return succeed();
}
