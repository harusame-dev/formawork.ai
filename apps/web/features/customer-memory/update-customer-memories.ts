import { fail, type Result, succeed } from "@harusame0616/result";
import { getLogger } from "@repo/logger/nextjs/server";
import { db } from "@workspace/db/client";
import { customersTable } from "@workspace/db/schema/customer";
import {
  customerMemoriesTable,
  type MemoryCategory,
} from "@workspace/db/schema/customer-memory";
import { customerNotesTable } from "@workspace/db/schema/customer-note";
import { and, asc, count, desc, eq, inArray } from "drizzle-orm";
import * as v from "valibot";
import { genderSchema } from "@/features/customer/schema";
import {
  type GenerateMemoryOperationsParams as GenerateMemoryOperationsParameters,
  generateMemoryOperations,
  type MemoryOperation,
} from "./generate-memory";

const MAX_MEMORIES_PER_CUSTOMER = 100;

const CUSTOMER_NOT_FOUND_ERROR = "顧客が見つかりません" as const;
const NOTES_NOT_FOUND_ERROR = "ノートが見つかりません" as const;

type UpdateCustomerMemoriesError =
  | typeof CUSTOMER_NOT_FOUND_ERROR
  | typeof NOTES_NOT_FOUND_ERROR;

interface CustomerData {
  birthDate: typeof customersTable.$inferSelect.birthDate;
  firstName: typeof customersTable.$inferSelect.firstName;
  gender: typeof customersTable.$inferSelect.gender;
  lastName: typeof customersTable.$inferSelect.lastName;
  remarks: typeof customersTable.$inferSelect.remarks;
}

async function fetchCustomerData(
  customerId: string,
): Promise<CustomerData | null> {
  const results = await db
    .select({
      birthDate: customersTable.birthDate,
      firstName: customersTable.firstName,
      gender: customersTable.gender,
      lastName: customersTable.lastName,
      remarks: customersTable.remarks,
    })
    .from(customersTable)
    .where(eq(customersTable.customerId, customerId));
  return results[0] ?? null;
}

interface NoteData {
  content: typeof customerNotesTable.$inferSelect.content;
  customerNoteId: typeof customerNotesTable.$inferSelect.customerNoteId;
  serviceDate: typeof customerNotesTable.$inferSelect.serviceDate;
}

async function fetchNotesData(noteIds: string[]): Promise<NoteData[]> {
  if (noteIds.length === 0) return [];

  return db
    .select({
      content: customerNotesTable.content,
      customerNoteId: customerNotesTable.customerNoteId,
      serviceDate: customerNotesTable.serviceDate,
    })
    .from(customerNotesTable)
    .where(inArray(customerNotesTable.customerNoteId, noteIds));
}

async function fetchExistingMemories(customerId: string): Promise<
  {
    category: MemoryCategory;
    content: string;
    id: string;
    importance: number;
    isProtected: boolean;
  }[]
> {
  const results = await db
    .select({
      category: customerMemoriesTable.category,
      content: customerMemoriesTable.content,
      id: customerMemoriesTable.id,
      importance: customerMemoriesTable.importance,
      isProtected: customerMemoriesTable.isProtected,
    })
    .from(customerMemoriesTable)
    .where(eq(customerMemoriesTable.customerId, customerId))
    .orderBy(
      desc(customerMemoriesTable.importance),
      desc(customerMemoriesTable.createdAt),
    );

  return results.map((r) => ({
    ...r,
    category: r.category as MemoryCategory,
  }));
}

async function executeOperation(
  customerId: string,
  operation: MemoryOperation,
  sourceNoteId: string | null,
): Promise<void> {
  const logger = await getLogger("executeMemoryOperation");

  switch (operation.operation) {
    case "create": {
      await db.insert(customerMemoriesTable).values({
        category: operation.category as MemoryCategory,
        content: operation.content,
        customerId,
        importance: operation.importance,
        sourceNoteId,
      });
      logger.info("メモリー作成", {
        category: operation.category,
        content: operation.content,
        customerId,
        reason: operation.reason,
      });
      break;
    }

    case "update": {
      const updateData: Record<string, unknown> = {};
      if (operation.newContent !== undefined) {
        updateData["content"] = operation.newContent;
      }
      if (operation.newImportance !== undefined) {
        updateData["importance"] = operation.newImportance;
      }
      if (Object.keys(updateData).length > 0) {
        await db
          .update(customerMemoriesTable)
          .set(updateData)
          .where(eq(customerMemoriesTable.id, operation.memoryId));
        logger.info("メモリー更新", {
          memoryId: operation.memoryId,
          reason: operation.reason,
          updates: updateData,
        });
      }
      break;
    }

    case "delete": {
      await db
        .delete(customerMemoriesTable)
        .where(eq(customerMemoriesTable.id, operation.memoryId));
      logger.info("メモリー削除", {
        memoryId: operation.memoryId,
        reason: operation.reason,
      });
      break;
    }
  }
}

function filterProtectedOperations(
  operations: MemoryOperation[],
  protectedMemoryIds: Set<string>,
): MemoryOperation[] {
  return operations.filter((op) => {
    if (op.operation === "create") {
      return true;
    }
    return !protectedMemoryIds.has(op.memoryId);
  });
}

async function enforceMemoryLimit(customerId: string): Promise<void> {
  const logger = await getLogger("enforceMemoryLimit");

  const countResult = await db
    .select({ count: count() })
    .from(customerMemoriesTable)
    .where(eq(customerMemoriesTable.customerId, customerId));

  const currentCount = countResult[0]?.count ?? 0;

  if (currentCount > MAX_MEMORIES_PER_CUSTOMER) {
    const deleteCount = currentCount - MAX_MEMORIES_PER_CUSTOMER;

    const idsToDelete = await db
      .select({ id: customerMemoriesTable.id })
      .from(customerMemoriesTable)
      .where(
        and(
          eq(customerMemoriesTable.customerId, customerId),
          eq(customerMemoriesTable.isProtected, false),
        ),
      )
      .orderBy(
        asc(customerMemoriesTable.importance),
        asc(customerMemoriesTable.createdAt),
      )
      .limit(deleteCount);

    if (idsToDelete.length > 0) {
      await db.delete(customerMemoriesTable).where(
        inArray(
          customerMemoriesTable.id,
          idsToDelete.map((r) => r.id),
        ),
      );
    }

    logger.info("メモリー件数制限適用", {
      customerId,
      deletedCount: idsToDelete.length,
      previousCount: currentCount,
    });
  }
}

export async function updateCustomerMemories(
  customerId: string,
  noteIds: string[],
): Promise<Result<void, UpdateCustomerMemoriesError>> {
  const logger = await getLogger("updateCustomerMemories");

  logger.info("メモリー更新開始", { customerId, noteIds });

  const customerData = await fetchCustomerData(customerId);
  if (!customerData) {
    return fail(CUSTOMER_NOT_FOUND_ERROR);
  }

  const targetNotes = await fetchNotesData(noteIds);
  if (targetNotes.length === 0) {
    return fail(NOTES_NOT_FOUND_ERROR);
  }

  const existingMemories = await fetchExistingMemories(customerId);
  const protectedMemoryIds = new Set(
    existingMemories.filter((m) => m.isProtected).map((m) => m.id),
  );

  const parameters: GenerateMemoryOperationsParameters = {
    customer: {
      birthDate: customerData.birthDate,
      firstName: customerData.firstName,
      gender: v.parse(genderSchema, customerData.gender),
      lastName: customerData.lastName,
      remarks: customerData.remarks,
    },
    existingMemories,
    targetNotes: targetNotes.map((note) => ({
      content: note.content,
      id: note.customerNoteId,
      serviceDate: note.serviceDate,
    })),
  };

  const result = await generateMemoryOperations(parameters);
  // プロンプトだけだと AI が守らない可能性もあるため、プログラム的にも保護
  const executableOperations = filterProtectedOperations(
    result.operations,
    protectedMemoryIds,
  );

  if (executableOperations.length > 0) {
    const primaryNoteId = targetNotes[0]?.customerNoteId ?? null;
    await Promise.allSettled(
      executableOperations.map((op) =>
        executeOperation(customerId, op, primaryNoteId),
      ),
    );
    await enforceMemoryLimit(customerId);
  }

  logger.info("メモリー更新完了", {
    customerId,
    executedCount: executableOperations.length,
  });

  return succeed();
}
