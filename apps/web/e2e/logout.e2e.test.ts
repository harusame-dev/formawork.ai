import { randomUUID } from "node:crypto";
import { test as base, expect, type Page } from "@playwright/test";
import { deleteStaff } from "@/features/staff/delete/delete-staff";
import { registerStaff } from "@/features/staff/register/register-staff";

// シードデータで定義されている管理者スタッフID（佐藤次郎）
const ADMIN_STAFF_ID = "00000000-0000-0000-0000-000000000003";

/**
 * ログアウトテストでは testWithAuthenticated を使用しない。
 *
 * 理由:
 * testWithAuthenticated は storageState を使用して認証状態を共有するが、
 * ログアウト操作は Supabase のセッションをサーバー側で無効化する。
 * これにより、同じ storageState を使用する他のテストで認証エラーが発生する可能性がある。
 *
 * そのため、ログアウトテスト専用のスタッフを作成し、
 * テスト内でログイン→ログアウトを行うことで、他のテストに影響を与えないようにする。
 */
const test = base.extend<{
  logoutTestPage: Page;
  testUser: {
    email: string;
    password: string;
    staffId: string;
  };
}>({
  async logoutTestPage({ browser, testUser }, use) {
    const page = await browser
      .newContext()
      .then((context) => context.newPage());

    // ログインページにアクセス
    await page.goto("/login");
    await page.waitForURL("/login");

    // ログイン
    await page.getByLabel("メールアドレス").fill(testUser.email);
    await page
      .getByRole("textbox", { name: "パスワード" })
      .fill(testUser.password);
    await page.getByRole("button", { name: "ログイン" }).click();

    // ホームにリダイレクトされるまで待機
    await page.waitForURL("/");

    // オンボーディングをスキップ状態に設定
    await page.evaluate(() => {
      localStorage.setItem("onboarding-completed", "true");
    });
    await page.reload();
    await page.waitForURL("/");

    await use(page);
  },
  // biome-ignore lint/correctness/noEmptyPattern: Playwrightのfixtureパターンで使用する標準的な記法
  async testUser({}, use) {
    const uniqueId = randomUUID().slice(0, 8);
    const userData = {
      email: `logout-test-${uniqueId}@example.com`,
      firstName: "ログアウト",
      lastName: `テスト${uniqueId}`,
      password: "Test@Pass123",
      role: "user" as const,
    };

    const result = await registerStaff(userData);
    if (!result.success) {
      throw new Error(`テストユーザーの登録に失敗: ${result.error}`);
    }

    await use({
      email: userData.email,
      password: userData.password,
      staffId: result.data.staffId,
    });

    // テスト後にクリーンアップ
    await deleteStaff({
      currentUserStaffId: ADMIN_STAFF_ID,
      staffId: result.data.staffId,
    });
  },
});

test("ログイン後、ログアウトするとログインページにリダイレクトされ、バックしてもホームに戻らない", async ({
  logoutTestPage,
}) => {
  await test.step("ユーザーメニューを開く", async () => {
    await logoutTestPage
      .getByRole("button", { name: "ユーザーメニューを開く" })
      .click();
  });

  await test.step("ログアウトボタンをクリックしてログインページにリダイレクトされることを確認", async () => {
    await logoutTestPage.getByRole("button", { name: "ログアウト" }).click();
    await logoutTestPage.waitForURL("/login");
  });

  await test.step("ブラウザバックしてもホームページに戻らないことを確認", async () => {
    await logoutTestPage.goBack();
    // RedirectType.replace を使用しているため、ホームページには戻らない
    await expect(logoutTestPage).not.toHaveURL("/");
  });
});
