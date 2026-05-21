import { randomUUID } from "node:crypto";
import { test as base, expect } from "vitest";
import { getAuthAdmin } from "./auth-admin";

const test = base.extend<{
  authAdmin: ReturnType<typeof getAuthAdmin>;
  cleanup: { authUserIds: string[] };
}>({
  authAdmin: async ({}, use) => {
    await use(getAuthAdmin());
  },
  cleanup: async ({ authAdmin }, use) => {
    const authUserIds: string[] = [];
    await use({ authUserIds });
    for (const id of authUserIds) {
      await authAdmin.deleteUser(id);
    }
  },
});

test("createUser でユーザーを作成できる", async ({ authAdmin, cleanup }) => {
  const uniqueId = randomUUID().slice(0, 8);
  const email = `auth-admin-create-${uniqueId}@example.com`;

  const result = await authAdmin.createUser({
    appMetadata: { role: "user", staffId: randomUUID() },
    email,
    password: "TestPassword123!",
  });

  expect(result.success).toBe(true);
  if (result.success) {
    expect(result.data.id).toBeDefined();
    cleanup.authUserIds.push(result.data.id);
  }
});

test("createUser で id を指定するとその id でユーザーが作成される", async ({
  authAdmin,
  cleanup,
}) => {
  const uniqueId = randomUUID().slice(0, 8);
  const email = `auth-admin-create-id-${uniqueId}@example.com`;
  const id = randomUUID();

  const result = await authAdmin.createUser({
    email,
    id,
    password: "TestPassword123!",
  });

  expect(result.success).toBe(true);
  if (result.success) {
    expect(result.data.id).toBe(id);
    cleanup.authUserIds.push(result.data.id);
  }
});

test("createUser で既存メールアドレスを指定すると EmailExists が返る", async ({
  authAdmin,
  cleanup,
}) => {
  const uniqueId = randomUUID().slice(0, 8);
  const email = `auth-admin-dup-${uniqueId}@example.com`;

  const firstResult = await authAdmin.createUser({
    email,
    password: "TestPassword123!",
  });
  expect(firstResult.success).toBe(true);
  if (firstResult.success) {
    cleanup.authUserIds.push(firstResult.data.id);
  }

  const secondResult = await authAdmin.createUser({
    email,
    password: "TestPassword123!",
  });

  expect(secondResult.success).toBe(false);
  if (!secondResult.success) {
    expect(secondResult.error).toBe("EmailExists");
  }
});

test("updateUserById で appMetadata を更新できる", async ({
  authAdmin,
  cleanup,
}) => {
  const uniqueId = randomUUID().slice(0, 8);
  const email = `auth-admin-update-${uniqueId}@example.com`;

  const createResult = await authAdmin.createUser({
    appMetadata: { role: "user", staffId: randomUUID() },
    email,
    password: "TestPassword123!",
  });
  expect(createResult.success).toBe(true);
  if (!createResult.success) return;
  cleanup.authUserIds.push(createResult.data.id);

  const newStaffId = randomUUID();
  const updateResult = await authAdmin.updateUserById(createResult.data.id, {
    appMetadata: { role: "admin", staffId: newStaffId },
  });

  expect(updateResult.success).toBe(true);

  const listResult = await authAdmin.listUsers();
  expect(listResult.success).toBe(true);
  if (!listResult.success) return;
  const user = listResult.data.find((u) => u.id === createResult.data.id);
  expect(user?.appMetadata.role).toBe("admin");
  expect(user?.appMetadata.staffId).toBe(newStaffId);
});

test("updateUserById で email を更新できる", async ({ authAdmin, cleanup }) => {
  const uniqueId = randomUUID().slice(0, 8);
  const oldEmail = `auth-admin-update-old-${uniqueId}@example.com`;
  const newEmail = `auth-admin-update-new-${uniqueId}@example.com`;

  const createResult = await authAdmin.createUser({
    email: oldEmail,
    password: "TestPassword123!",
  });
  expect(createResult.success).toBe(true);
  if (!createResult.success) return;
  cleanup.authUserIds.push(createResult.data.id);

  const updateResult = await authAdmin.updateUserById(createResult.data.id, {
    email: newEmail,
  });

  expect(updateResult.success).toBe(true);

  const listResult = await authAdmin.listUsers();
  if (!listResult.success) return;
  const user = listResult.data.find((u) => u.id === createResult.data.id);
  expect(user?.email).toBe(newEmail);
});

test("deleteUser でユーザーを削除できる", async ({ authAdmin }) => {
  const uniqueId = randomUUID().slice(0, 8);
  const email = `auth-admin-delete-${uniqueId}@example.com`;

  const createResult = await authAdmin.createUser({
    email,
    password: "TestPassword123!",
  });
  expect(createResult.success).toBe(true);
  if (!createResult.success) return;

  const deleteResult = await authAdmin.deleteUser(createResult.data.id);

  expect(deleteResult.success).toBe(true);

  const listResult = await authAdmin.listUsers();
  if (!listResult.success) return;
  const user = listResult.data.find((u) => u.id === createResult.data.id);
  expect(user).toBeUndefined();
});

test("listUsers で作成済みユーザーを取得できる", async ({
  authAdmin,
  cleanup,
}) => {
  const uniqueId = randomUUID().slice(0, 8);
  const email = `auth-admin-list-${uniqueId}@example.com`;
  const staffId = randomUUID();

  const createResult = await authAdmin.createUser({
    appMetadata: { role: "admin", staffId },
    email,
    password: "TestPassword123!",
  });
  expect(createResult.success).toBe(true);
  if (!createResult.success) return;
  cleanup.authUserIds.push(createResult.data.id);

  const listResult = await authAdmin.listUsers();
  expect(listResult.success).toBe(true);
  if (!listResult.success) return;

  const user = listResult.data.find((u) => u.id === createResult.data.id);
  expect(user).toBeDefined();
  expect(user?.email).toBe(email);
  expect(user?.appMetadata.role).toBe("admin");
  expect(user?.appMetadata.staffId).toBe(staffId);
});
