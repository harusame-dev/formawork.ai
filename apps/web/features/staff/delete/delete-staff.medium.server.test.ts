import { db } from "@workspace/db/client";
import { staffsTable } from "@workspace/db/schema/staff";
import { eq } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import { test as base, expect, type Mock, vi } from "vitest";
import { deleteStaff } from "./delete-staff";

vi.mock("@repo/logger/nextjs/server", () => ({
  getLogger: vi.fn().mockResolvedValue({
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
  }),
}));

vi.mock("@/features/auth/auth-admin", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("@/features/auth/auth-admin")>();
  return {
    ...actual,
    getAuthAdmin: vi.fn(),
  };
});

const test = base.extend<{
  staff: {
    firstName: string;
    lastName: string;
    staffId: string;
  };
  staffWithAuthUser: {
    authUserId: string;
    firstName: string;
    lastName: string;
    staffId: string;
  };
  authAdminMock: Mock;
}>({
  async staff({}, use) {
    const staff = {
      firstName: "太郎",
      lastName: "テスト",
      staffId: randomUUID(),
    };

    await db.insert(staffsTable).values(staff);
    await use(staff);
    await db.delete(staffsTable).where(eq(staffsTable.staffId, staff.staffId));
  },
  async staffWithAuthUser({}, use) {
    const authUserId = randomUUID();
    const staff = {
      authUserId,
      firstName: "太郎",
      lastName: "テスト",
      staffId: randomUUID(),
    };

    await db.insert(staffsTable).values(staff);
    await use(staff);
    await db.delete(staffsTable).where(eq(staffsTable.staffId, staff.staffId));
  },
  async authAdminMock({}, use) {
    const authAdminModule = await import("@/features/auth/auth-admin");
    const mock = vi.mocked(authAdminModule.getAuthAdmin);
    await use(mock);
    vi.clearAllMocks();
  },
});

test("存在しないスタッフを削除しようとした場合にエラーが返される", async () => {
  const nonExistentStaffId = "99999999-9999-9999-9999-999999999999";
  const currentUserStaffId = "00000000-0000-0000-0000-000000000001";

  const result = await deleteStaff({
    currentUserStaffId,
    staffId: nonExistentStaffId,
  });

  expect(result.success).toBe(false);
  if (!result.success) {
    expect(result.error).toBe("指定されたスタッフが見つかりません");
  }
});

test("自分自身を削除しようとした場合にエラーが返される", async ({ staff }) => {
  const result = await deleteStaff({
    currentUserStaffId: staff.staffId,
    staffId: staff.staffId,
  });

  expect(result.success).toBe(false);
  if (!result.success) {
    expect(result.error).toBe("自分自身は削除できません");
  }
});

test("存在するスタッフを削除できる", async ({
  staffWithAuthUser,
  authAdminMock,
}) => {
  const currentUserStaffId = "00000000-0000-0000-0000-000000000001";

  authAdminMock.mockReturnValue({
    createUser: vi.fn(),
    deleteUser: vi.fn().mockResolvedValue({ success: true, data: undefined }),
    listUsers: vi.fn(),
    updateUserById: vi.fn(),
  });

  const result = await deleteStaff({
    currentUserStaffId,
    staffId: staffWithAuthUser.staffId,
  });

  expect(result.success).toBe(true);

  const [deletedStaff] = await db
    .select()
    .from(staffsTable)
    .where(eq(staffsTable.staffId, staffWithAuthUser.staffId))
    .limit(1);

  expect(deletedStaff).toBeUndefined();
});

test("authUserId が null のスタッフを削除できる", async ({ staff }) => {
  const currentUserStaffId = "00000000-0000-0000-0000-000000000001";

  const result = await deleteStaff({
    currentUserStaffId,
    staffId: staff.staffId,
  });

  expect(result.success).toBe(true);

  const [deletedStaff] = await db
    .select()
    .from(staffsTable)
    .where(eq(staffsTable.staffId, staff.staffId))
    .limit(1);

  expect(deletedStaff).toBeUndefined();
});
