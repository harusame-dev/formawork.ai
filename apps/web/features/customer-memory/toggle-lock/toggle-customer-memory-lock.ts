import { fail, type Result, succeed } from "@harusame0616/result";
import { db } from "@workspace/db/client";
import { customerMemoriesTable } from "@workspace/db/schema/customer-memory";
import { eq } from "drizzle-orm";

export async function toggleCustomerMemoryLock({
  memoryId,
}: {
  memoryId: string;
}): Promise<
  Result<{ isProtected: boolean; customerId: string }, "メモリが存在しません">
> {
  const memories = await db
    .select({
      customerId: customerMemoriesTable.customerId,
      isProtected: customerMemoriesTable.isProtected,
    })
    .from(customerMemoriesTable)
    .where(eq(customerMemoriesTable.id, memoryId))
    .limit(1);

  if (!memories[0]) {
    return fail("メモリが存在しません");
  }

  const newIsProtected = !memories[0].isProtected;

  await db
    .update(customerMemoriesTable)
    .set({ isProtected: newIsProtected })
    .where(eq(customerMemoriesTable.id, memoryId));

  return succeed({
    customerId: memories[0].customerId,
    isProtected: newIsProtected,
  });
}
