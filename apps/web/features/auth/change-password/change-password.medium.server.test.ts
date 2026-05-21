import { randomUUID } from "node:crypto";
import { db } from "@workspace/db/client";
import { staffsTable } from "@workspace/db/schema/staff";
import { eq } from "drizzle-orm";
import { test as base, expect, vi } from "vitest";
import { AuthError, getAuth } from "@/features/auth/auth";
import { getAuthAdmin } from "@/features/auth/auth-admin";
import { changePassword } from "./change-password";

vi.mock("@/features/auth/auth", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/features/auth/auth")>();
  return {
    ...actual,
    getAuth: vi.fn(),
  };
});

const test = base.extend<{
  cleanup: { authUserIds: string[]; staffIds: string[] };
  testUser: { authUserId: string; email: string; password: string };
}>({
  cleanup: async ({}, use) => {
    const authUserIds: string[] = [];
    const staffIds: string[] = [];
    await use({ authUserIds, staffIds });

    const authAdmin = getAuthAdmin();
    for (const staffId of staffIds) {
      await db.delete(staffsTable).where(eq(staffsTable.staffId, staffId));
    }
    for (const authUserId of authUserIds) {
      await authAdmin.deleteUser(authUserId);
    }
  },
  testUser: async ({ cleanup }, use) => {
    const authAdmin = getAuthAdmin();
    const uniqueId = randomUUID().slice(0, 8);
    const email = `change-password-test-${uniqueId}@example.com`;
    const password = "Test@Pass123";
    const staffId = randomUUID();
    const authUserId = randomUUID();

    await db.insert(staffsTable).values({
      authUserId,
      firstName: "テスト",
      lastName: `ユーザー${uniqueId}`,
      staffId,
    });
    cleanup.staffIds.push(staffId);

    const createResult = await authAdmin.createUser({
      appMetadata: { role: "user", staffId },
      email,
      id: authUserId,
      password,
    });

    if (!createResult.success) {
      throw new Error(`テストユーザーの作成に失敗: ${createResult.error}`);
    }

    cleanup.authUserIds.push(createResult.data.id);

    vi.mocked(getAuth).mockResolvedValue({
      verifyCurrentPassword: vi.fn(async (inputPassword: string) =>
        inputPassword === password
          ? { success: true, data: undefined }
          : { success: false, error: AuthError.InvalidCredentials },
      ),
      updatePassword: vi.fn().mockResolvedValue({
        success: true,
        data: undefined,
      }),
    } as never);

    await use({ authUserId, email, password });

    vi.mocked(getAuth).mockReset();
  },
});

test("正しい現在のパスワードで新しいパスワードに変更できる", async ({
  testUser,
}) => {
  const newPassword = "NewPass@456";

  const result = await changePassword({
    currentPassword: testUser.password,
    newPassword,
  });

  expect(result.success).toBe(true);
});

test("間違った現在のパスワードでエラーが返る", async ({
  testUser: _testUser,
}) => {
  const wrongPassword = "WrongPass@123";
  const newPassword = "NewPass@456";

  const result = await changePassword({
    currentPassword: wrongPassword,
    newPassword,
  });

  expect(result.success).toBe(false);
  if (!result.success) {
    expect(result.error).toBe("現在のパスワードが正しくありません");
  }
});

test("セッションが無効な場合エラーが返る", async () => {
  vi.mocked(getAuth).mockResolvedValue({
    verifyCurrentPassword: vi.fn().mockResolvedValue({
      success: false,
      error: AuthError.SessionExpired,
    }),
  } as never);

  const result = await changePassword({
    currentPassword: "Current@123",
    newPassword: "NewPass@456",
  });

  expect(result.success).toBe(false);
  if (!result.success) {
    expect(result.error).toBe("セッションが無効です。再度ログインしてください");
  }
});

test("パスワード更新に失敗した場合エラーが返る", async ({ testUser }) => {
  vi.mocked(getAuth).mockResolvedValue({
    verifyCurrentPassword: vi.fn().mockResolvedValue({
      success: true,
      data: undefined,
    }),
    updatePassword: vi.fn().mockResolvedValue({
      success: false,
      error: AuthError.UpdateFailed,
    }),
  } as never);

  const result = await changePassword({
    currentPassword: testUser.password,
    newPassword: "NewPass@456",
  });

  expect(result.success).toBe(false);
  if (!result.success) {
    expect(result.error).toBe("パスワードの更新に失敗しました");
  }
});
