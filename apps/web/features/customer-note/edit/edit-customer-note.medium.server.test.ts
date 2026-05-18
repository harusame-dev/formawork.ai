import { randomUUID } from "node:crypto";
import { db } from "@workspace/db/client";
import { customerNotesTable } from "@workspace/db/schema/customer-note";
import { eq } from "drizzle-orm";
import { test as base, expect, vi } from "vitest";
import { UserRole } from "@/features/auth/get-user-role";
import { editCustomerNote } from "./edit-customer-note";

// Loggerをモック
vi.mock("@repo/logger/nextjs/server", () => ({
  getLogger: vi.fn().mockResolvedValue({
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
  }),
}));

const test = base.extend<{
  customerNoteId: string;
}>({
  // biome-ignore lint/correctness/noEmptyPattern: vitest の標準記法
  async customerNoteId({}, use) {
    const customerNoteId = randomUUID();

    await db.insert(customerNotesTable).values([
      {
        content: customerNoteId,
        createdAt: new Date("2024-09-15T14:00:00"),
        customerId: "00000000-0000-0000-0000-000000000011",
        customerNoteId,
        serviceDate: "2024-09-15",
        staffId: "00000000-0000-0000-0000-000000000001",
      },
    ]);

    await use(customerNoteId);

    await db
      .delete(customerNotesTable)
      .where(eq(customerNotesTable.customerNoteId, customerNoteId));
  },
});

test("管理者ではない別ユーザーが他人のノートを編集しようとした場合にエラーが返される", async ({
  customerNoteId,
}) => {
  // 別ユーザー（staffId: 00000000-0000-0000-0000-000000000002）で編集を試みる
  const result = await editCustomerNote({
    content: "編集後の内容",
    customerNoteId,
    keepImagePaths: [],
    serviceDate: "2024-01-01",
    uploadImages: [],
    user: {
      role: UserRole.User,
      userId: "00000000-0000-0000-0000-000000000002",
    },
  });

  expect(result.success).toBe(false);
  if (!result.success) {
    expect(result.error).toBe("この操作を実行する権限がありません");
  }
});
