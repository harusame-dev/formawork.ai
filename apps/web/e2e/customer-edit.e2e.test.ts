import { randomUUID } from "node:crypto";
import { expect } from "@playwright/test";
import { db } from "@workspace/db/client";
import { customersTable } from "@workspace/db/schema/customer";
import { eq } from "drizzle-orm";
import { testWithAuthenticated } from "./fixtures/authenticated-test";

const test = testWithAuthenticated.extend<{
  testCustomer: { customerId: string };
}>({
  // biome-ignore lint/correctness/noEmptyPattern: Playwrightのfixtureパターンで使用する標準的な記法
  async testCustomer({}, use) {
    const customerId = randomUUID();
    await db.insert(customersTable).values({
      customerId,
      email: `${randomUUID()}@example.com`,
      firstName: randomUUID().slice(0, 12),
      lastName: randomUUID().slice(0, 12),
      phone: `${Math.floor(Math.random() * 1_000_000_000)}`,
    });
    await use({ customerId });
    await db
      .delete(customersTable)
      .where(eq(customersTable.customerId, customerId));
  },
});

test("管理者が必須フィールドを全て入力して編集できる", async ({
  pageWithAdminUser: page,
  testCustomer,
}) => {
  await test.step("顧客編集ページへ遷移", async () => {
    await page.goto(`/customers/${testCustomer.customerId}/edit`);
    await page.waitForURL(`/customers/${testCustomer.customerId}/edit`);
    await expect(page.getByText("読み込み中")).toBeHidden();
  });

  const newCustomer = {
    email: `${randomUUID()}@example.com`,
    firstName: randomUUID().slice(0, 12),
    lastName: randomUUID().slice(0, 12),
    phone: `${Math.floor(Math.random() * 1_000_000_000)}`,
  };
  await test.step("顧客情報を編集", async () => {
    const main = page.getByRole("main");
    // 負の先読みを使用して「姓」だけにマッチさせる（「姓（かな）」を除外）
    await main.getByLabel(/^姓(?!（かな）)/).clear();
    await main.getByLabel(/^姓(?!（かな）)/).fill(newCustomer.lastName);

    // 負の先読みを使用して「名」だけにマッチさせる（「名（かな）」を除外）
    await main.getByLabel(/^名(?!（かな）)/).clear();
    await main.getByLabel(/^名(?!（かな）)/).fill(newCustomer.firstName);

    await main.getByLabel("メールアドレス").clear();
    await main.getByLabel("メールアドレス").fill(newCustomer.email);

    await main.getByLabel("電話番号").clear();
    await main.getByLabel("電話番号").fill(newCustomer.phone);

    await page.getByRole("button", { name: "編集する" }).click();
  });

  await test.step("顧客詳細ページにリダイレクトされる", async () => {
    await page.waitForURL(`/customers/${testCustomer.customerId}`);
  });

  await test.step("編集内容が反映されていることを確認", async () => {
    await expect(
      page.getByRole("heading", {
        name: `${newCustomer.lastName} ${newCustomer.firstName}`,
      }),
    ).toBeVisible();
    await expect(page.getByText(newCustomer.email)).toBeVisible();
    await expect(page.getByText(newCustomer.phone)).toBeVisible();
  });
});

test("管理者が必須フィールド以外を空で編集できる", async ({
  pageWithAdminUser: page,
  testCustomer,
}) => {
  await test.step("編集ページへ遷移", async () => {
    await page.goto(`/customers/${testCustomer.customerId}/edit`);
    await page.waitForURL(`/customers/${testCustomer.customerId}/edit`);
    await expect(page.getByText("読み込み中")).toBeHidden();
  });

  await test.step("メールアドレスと電話番号をクリア", async () => {
    const main = page.getByRole("main");
    await main.getByLabel("メールアドレス").clear();
    await main.getByLabel("電話番号").clear();
  });

  await test.step("更新ボタンをクリック", async () => {
    await page.getByRole("button", { name: "編集する" }).click();
  });

  await test.step("顧客詳細ページにリダイレクトされる", async () => {
    await page.waitForURL(`/customers/${testCustomer.customerId}`);
  });

  await test.step("メールアドレスと電話番号が「未登録」と表示されることを確認", async () => {
    await expect(
      page.locator('text="メールアドレス"').locator("..").getByText("未登録"),
    ).toBeVisible();
    await expect(
      page.locator('text="電話番号"').locator("..").getByText("未登録"),
    ).toBeVisible();
  });
});

test("一般ユーザーには顧客詳細ページで編集リンクが表示されない", async ({
  pageWithGenericUser: page,
  testCustomer,
}) => {
  await test.step("顧客詳細ページに遷移", async () => {
    await page.goto(`/customers/${testCustomer.customerId}`);
    await page.waitForURL(`/customers/${testCustomer.customerId}`);
  });

  await test.step("編集リンクが表示されないことを確認", async () => {
    await expect(page.getByRole("link", { name: "編集" })).toBeHidden();
  });
});
