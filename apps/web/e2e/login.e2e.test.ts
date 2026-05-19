import { randomUUID } from "node:crypto";
import { test as base, expect, type Page } from "@playwright/test";
import { deleteStaff } from "@/features/staff/delete/delete-staff";
import { registerStaff } from "@/features/staff/register/register-staff";

interface TestUser {
  email: string;
  password: string;
}

async function createTestUser(parameters: {
  email: string;
  password: string;
}): Promise<{ staffId: string; testUser: TestUser }> {
  const testUser: TestUser = {
    email: parameters.email,
    password: parameters.password,
  };

  const result = await registerStaff({
    email: testUser.email,
    firstName: "テスト",
    lastName: "ユーザー",
    password: testUser.password,
    role: "user",
  });

  if (!result.success) {
    throw new Error(`テストユーザーの作成に失敗: ${result.error}`);
  }

  return { staffId: result.data.staffId, testUser };
}

async function cleanupTestUser(staffId: string): Promise<void> {
  await deleteStaff({
    currentUserStaffId: "cleanup-user",
    staffId,
  });
}

const test = base.extend<{
  loginPage: Page;
  maxEmailUser: TestUser;
  maxPasswordUser: TestUser;
  minEmailUser: TestUser;
  minPasswordUser: TestUser;
}>({
  loginPage: async ({ page }, use) => {
    await page.goto("/login");
    await page.waitForURL("/login");
    await use(page);
  },

  maxEmailUser: async ({}, use) => {
    // 254文字のメールアドレス (242 + 1(@) + 11(example.com) = 254文字)
    const randomString = randomUUID().slice(0, 8);
    const padding = "a".repeat(242 - randomString.length);
    const { staffId, testUser } = await createTestUser({
      email: `${randomString}${padding}@example.com`,
      password: "Test@Pass123",
    });

    await use(testUser);
    await cleanupTestUser(staffId);
  },

  maxPasswordUser: async ({}, use) => {
    // 64文字のパスワードでユーザーを作成
    const randomString = randomUUID().slice(0, 8);
    const { staffId, testUser } = await createTestUser({
      email: `max-password-${randomString}@example.com`,
      password: "a".repeat(64),
    });

    await use(testUser);
    await cleanupTestUser(staffId);
  },

  minEmailUser: async ({}, use) => {
    // 最小文字数のメールアドレス（email形式として有効な最短形式）
    const randomString = randomUUID().slice(0, 4);
    const { staffId, testUser } = await createTestUser({
      email: `${randomString}@a.co`,
      password: "Test@Pass123",
    });

    await use(testUser);
    await cleanupTestUser(staffId);
  },

  minPasswordUser: async ({}, use) => {
    // 最小文字数のパスワード（8文字）でユーザーを作成
    const randomString = randomUUID().slice(0, 8);
    const { staffId, testUser } = await createTestUser({
      email: `min-password-${randomString}@example.com`,
      password: "Ab1@1234",
    });

    await use(testUser);
    await cleanupTestUser(staffId);
  },
});

test("正しいメールアドレスとパスワードを入力するとホームにリダイレクトされ、バックしてもログインページに戻らない", async ({
  loginPage,
}) => {
  await test.step("有効なメールアドレスとパスワードを入力", async () => {
    await loginPage.getByLabel("メールアドレス").fill("test1@example.com");
    await loginPage
      .getByRole("textbox", { name: "パスワード" })
      .fill("Test@Pass123");
  });

  await test.step("ログインボタンをクリック", async () => {
    await loginPage.getByRole("button", { name: "ログイン" }).click();
  });

  await test.step("ホームページにリダイレクトされることを確認", async () => {
    await expect(loginPage).toHaveURL("/");
  });

  await test.step("ブラウザバックを実行", async () => {
    await loginPage.goBack();
  });

  await test.step("ログインページに戻らないことを確認", async () => {
    await expect(loginPage).toHaveURL("about:blank");
  });
});

test("最大文字数のメールアドレス（254文字）でログインできる", async ({
  loginPage,
  maxEmailUser,
}) => {
  await test.step("254文字のメールアドレスと有効なパスワードを入力", async () => {
    await loginPage.getByLabel("メールアドレス").fill(maxEmailUser.email);
    await loginPage
      .getByRole("textbox", { name: "パスワード" })
      .fill(maxEmailUser.password);
  });

  await test.step("ログインボタンをクリック", async () => {
    await loginPage.getByRole("button", { name: "ログイン" }).click();
  });

  await test.step("ホームページにリダイレクトされることを確認", async () => {
    await expect(loginPage).toHaveURL("/");
  });
});

test("最大文字数のパスワード（64文字）のパスワードでログインできる", async ({
  loginPage,
  maxPasswordUser,
}) => {
  await test.step("有効なメールアドレスと64文字のパスワードを入力", async () => {
    await loginPage.getByLabel("メールアドレス").fill(maxPasswordUser.email);
    await loginPage
      .getByRole("textbox", { name: "パスワード" })
      .fill(maxPasswordUser.password);
  });

  await test.step("ログインボタンをクリック", async () => {
    await loginPage.getByRole("button", { name: "ログイン" }).click();
  });

  await test.step("ホームページにリダイレクトされることを確認", async () => {
    await expect(loginPage).toHaveURL("/");
  });
});

test("最小文字数のメールアドレスでログインできる", async ({
  loginPage,
  minEmailUser,
}) => {
  await test.step("最小文字数のメールアドレスと有効なパスワードを入力", async () => {
    await loginPage.getByLabel("メールアドレス").fill(minEmailUser.email);
    await loginPage
      .getByRole("textbox", { name: "パスワード" })
      .fill(minEmailUser.password);
  });

  await test.step("ログインボタンをクリック", async () => {
    await loginPage.getByRole("button", { name: "ログイン" }).click();
  });

  await test.step("ホームページにリダイレクトされることを確認", async () => {
    await expect(loginPage).toHaveURL("/");
  });
});

test("最小文字数のパスワード（8文字）でログインできる", async ({
  loginPage,
  minPasswordUser,
}) => {
  await test.step("有効なメールアドレスと8文字のパスワードを入力", async () => {
    await loginPage.getByLabel("メールアドレス").fill(minPasswordUser.email);
    await loginPage
      .getByRole("textbox", { name: "パスワード" })
      .fill(minPasswordUser.password);
  });

  await test.step("ログインボタンをクリック", async () => {
    await loginPage.getByRole("button", { name: "ログイン" }).click();
  });

  await test.step("ホームページにリダイレクトされることを確認", async () => {
    await expect(loginPage).toHaveURL("/");
  });
});
