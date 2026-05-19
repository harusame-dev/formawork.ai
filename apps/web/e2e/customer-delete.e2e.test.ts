import { randomUUID } from "node:crypto";
import { expect } from "@playwright/test";
import { db } from "@workspace/db/client";
import { customersTable } from "@workspace/db/schema/customer";
import { eq } from "drizzle-orm";
import { testWithAuthenticated } from "./fixtures/authenticated-test";

const test = testWithAuthenticated.extend<{
  testCustomer: {
    customerId: string;
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
  };
}>({
  async testCustomer({}, use) {
    const customerId = randomUUID();
    const customer = {
      customerId,
      email: `${randomUUID()}@example.com`,
      firstName: randomUUID().slice(0, 12),
      lastName: randomUUID().slice(0, 12),
      phone: `${Math.floor(Math.random() * 1_000_000_000)}`,
    };

    await db.insert(customersTable).values(customer);
    await use(customer);
    await db
      .delete(customersTable)
      .where(eq(customersTable.customerId, customerId));
  },
});

test("管理者が顧客を削除できる", async ({
  pageWithAdminUser: page,
  testCustomer,
}) => {
  await test.step("顧客詳細ページに遷移", async () => {
    await page.goto(`/customers/${testCustomer.customerId}`);
    await page.waitForURL(`/customers/${testCustomer.customerId}`);
  });

  await test.step("削除実行", async () => {
    await page.getByRole("button", { name: "削除" }).click();
    await page
      .getByRole("dialog")
      .getByRole("button", { name: "削除" })
      .click();
    await page.waitForURL("/customers");
  });

  await test.step("削除された顧客を検索してもヒットしないことを確認", async () => {
    await page
      .getByRole("main")
      .getByLabel("キーワード")
      .fill(testCustomer.lastName);
    await page.getByRole("button", { name: "検索" }).click();

    // 「顧客が見つかりませんでした」が表示される
    await expect(page.getByText("顧客が見つかりませんでした")).toBeVisible();
  });
});

test("一般ユーザーには顧客編集・削除ボタンが表示されない", async ({
  pageWithGenericUser: page,
  testCustomer,
}) => {
  await test.step("顧客詳細ページに遷移", async () => {
    await page.goto(`/customers/${testCustomer.customerId}`);
    await page.waitForURL(`/customers/${testCustomer.customerId}`);
  });

  await test.step("編集・削除ボタンが表示されないことを確認", async () => {
    await expect(page.getByRole("link", { name: "編集" })).toBeHidden();
    await expect(page.getByRole("button", { name: "削除" })).toBeHidden();
  });
});
