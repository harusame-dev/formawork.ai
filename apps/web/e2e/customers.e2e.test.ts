import { randomUUID } from "node:crypto";
import { expect, type Page } from "@playwright/test";
import { db } from "@workspace/db/client";
import { customersTable } from "@workspace/db/schema/customer";
import { eq } from "drizzle-orm";
import { testWithAuthenticated } from "./fixtures/authenticated-test";

/** ランダムなひらがな文字列を生成 */
function generateRandomHiragana(length: number): string {
  const hiragana =
    "あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをん";
  let result = "";
  for (let index = 0; index < length; index++) {
    result += hiragana[Math.floor(Math.random() * hiragana.length)];
  }
  return result;
}

const test = testWithAuthenticated.extend<{
  customersPage: Page;
  searchPaginationCustomers: {
    keyword: string;
    count: number;
  };
  searchTestCustomer: {
    customerId: string;
    lastName: string;
    firstName: string;
    lastNameKana: string;
    firstNameKana: string;
    phone: string;
    email: string;
  };
}>({
  customersPage: async ({ pageWithGenericUser: page }, use) => {
    // 顧客一覧ページに遷移
    await page.goto("/customers");
    await page.waitForURL("/customers");
    await expect(page.getByRole("main").getByText(/読み込み中/)).toHaveCount(0);

    await use(page);
  },
  searchPaginationCustomers: async ({}, use) => {
    const keyword = randomUUID().slice(0, 8);
    const count = 40;
    const customers = Array.from({ length: count }, (_, index) => ({
      customerId: randomUUID(),
      email: `${keyword}-${index}@example.com`,
      firstName: keyword,
      lastName: `テスト${index}`,
      phone: `0900000${String(index).padStart(4, "0")}`,
    }));

    await db.insert(customersTable).values(customers);

    await use({ count, keyword });

    // クリーンアップ
    await db
      .delete(customersTable)
      .where(eq(customersTable.firstName, keyword));
  },
  searchTestCustomer: async ({}, use) => {
    const uniqueId = randomUUID().slice(0, 8);
    // 電話番号用のランダムな数字を生成（11桁）
    const randomPhone = `090${Math.floor(Math.random() * 100_000_000)
      .toString()
      .padStart(8, "0")}`;
    // カナ用のランダムなひらがなを生成（8文字）
    const randomKana = generateRandomHiragana(8);
    const customer = {
      customerId: randomUUID(),
      email: `${uniqueId}@example.com`,
      firstName: `名${uniqueId}`,
      firstNameKana: `めい${randomKana}`,
      lastName: `姓${uniqueId}`,
      lastNameKana: `せい${randomKana}`,
      phone: randomPhone,
    };

    await db.insert(customersTable).values(customer);

    await use(customer);

    await db
      .delete(customersTable)
      .where(eq(customersTable.customerId, customer.customerId));
  },
});

test("メニューから顧客一覧ページに遷移できる", async ({
  pageWithGenericUser: page,
}) => {
  await test.step("メニューボタンをクリックしてメニューを開く", async () => {
    await page.getByRole("button", { name: /^メニューを開く$/ }).click();
  });

  await test.step("顧客一覧リンクをクリック", async () => {
    await page.getByRole("link", { name: "顧客一覧" }).click();
  });

  await test.step("顧客一覧ページに遷移することを確認", async () => {
    await expect(page).toHaveURL("/customers");
    await expect(page.getByRole("heading", { name: "顧客一覧" })).toBeVisible();
  });
});

test("名前で検索できる", async ({ customersPage }) => {
  const searchKeyword = "太郎";

  await test.step("名前を入力して検索", async () => {
    await customersPage
      .getByRole("main")
      .getByLabel("キーワード")
      .fill(searchKeyword);
    await customersPage.getByRole("button", { name: "検索" }).click();
    await customersPage.waitForURL("**/customers?keyword=*");
    await expect(
      customersPage.getByRole("main").getByText(/読み込み中/),
    ).toHaveCount(0);
  });

  await test.step("検索結果を確認", async () => {
    // 表示されている全てのデータがキーワードを含んでいることを確認
    const rows = customersPage.locator("table tbody tr");
    const count = await rows.count();
    for (let index = 0; index < count; index++) {
      const row = rows.nth(index);
      const text = await row.textContent();
      expect(text).toContain(searchKeyword);
    }
  });
});

test("姓で前方一致検索できる", async ({
  customersPage,
  searchTestCustomer,
}) => {
  // 姓の前方6文字で検索（例: "姓abc12" で "姓abc12345" がヒット）
  const searchKeyword = searchTestCustomer.lastName.slice(0, 6);

  await test.step("姓で検索", async () => {
    await customersPage
      .getByRole("main")
      .getByLabel("キーワード")
      .fill(searchKeyword);
    await customersPage.getByRole("button", { name: "検索" }).click();
    await customersPage.waitForURL("**/customers?keyword=*");
    await expect(
      customersPage.getByRole("main").getByText(/読み込み中/),
    ).toHaveCount(0);
  });

  await test.step("検索結果を確認", async () => {
    const table = customersPage.getByRole("table", { name: "顧客検索結果" });
    await expect(table).toContainText(searchTestCustomer.lastName);
    await expect(table).toContainText(searchTestCustomer.firstName);
  });
});

test("名で前方一致検索できる", async ({
  customersPage,
  searchTestCustomer,
}) => {
  // 名の前方6文字で検索（例: "名abc12" で "名abc12345" がヒット）
  const searchKeyword = searchTestCustomer.firstName.slice(0, 6);

  await test.step("名で検索", async () => {
    await customersPage
      .getByRole("main")
      .getByLabel("キーワード")
      .fill(searchKeyword);
    await customersPage.getByRole("button", { name: "検索" }).click();
    await customersPage.waitForURL("**/customers?keyword=*");
    await expect(
      customersPage.getByRole("main").getByText(/読み込み中/),
    ).toHaveCount(0);
  });

  await test.step("検索結果を確認", async () => {
    const table = customersPage.getByRole("table", { name: "顧客検索結果" });
    await expect(table).toContainText(searchTestCustomer.lastName);
    await expect(table).toContainText(searchTestCustomer.firstName);
  });
});

test("せいで前方一致検索できる", async ({
  customersPage,
  searchTestCustomer,
}) => {
  const searchKeyword = searchTestCustomer.lastNameKana.slice(0, 7);

  await test.step("せいで検索", async () => {
    await customersPage
      .getByRole("main")
      .getByLabel("キーワード")
      .fill(searchKeyword);
    await customersPage.getByRole("button", { name: "検索" }).click();
    await customersPage.waitForURL("**/customers?keyword=*");
    await expect(
      customersPage.getByRole("main").getByText(/読み込み中/),
    ).toHaveCount(0);
  });

  await test.step("検索結果を確認", async () => {
    const table = customersPage.getByRole("table", { name: "顧客検索結果" });
    await expect(table).toContainText(searchTestCustomer.lastName);
    await expect(table).toContainText(searchTestCustomer.firstName);
  });
});

test("めいで前方一致検索できる", async ({
  customersPage,
  searchTestCustomer,
}) => {
  // めいの前方7文字で検索（例: "めいabc12" で "めいabc12345" がヒット）
  const searchKeyword = searchTestCustomer.firstNameKana.slice(0, 7);

  await test.step("メイで検索", async () => {
    await customersPage
      .getByRole("main")
      .getByLabel("キーワード")
      .fill(searchKeyword);
    await customersPage.getByRole("button", { name: "検索" }).click();
    await customersPage.waitForURL("**/customers?keyword=*");
    await expect(
      customersPage.getByRole("main").getByText(/読み込み中/),
    ).toHaveCount(0);
  });

  await test.step("検索結果を確認", async () => {
    const table = customersPage.getByRole("table", { name: "顧客検索結果" });
    await expect(table).toContainText(searchTestCustomer.lastName);
    await expect(table).toContainText(searchTestCustomer.firstName);
  });
});

test("姓名（結合）で前方一致検索できる", async ({
  customersPage,
  searchTestCustomer,
}) => {
  // 姓名（結合）の前方部分で検索（例: "姓abc12345名" で "姓abc12345名abc12345" がヒット）
  const fullName = `${searchTestCustomer.lastName}${searchTestCustomer.firstName}`;
  const searchKeyword = fullName.slice(0, -4);

  await test.step("姓名で検索", async () => {
    await customersPage
      .getByRole("main")
      .getByLabel("キーワード")
      .fill(searchKeyword);
    await customersPage.getByRole("button", { name: "検索" }).click();
    await customersPage.waitForURL("**/customers?keyword=*");
    await expect(
      customersPage.getByRole("main").getByText(/読み込み中/),
    ).toHaveCount(0);
  });

  await test.step("検索結果を確認", async () => {
    const table = customersPage.getByRole("table", { name: "顧客検索結果" });
    await expect(table).toContainText(searchTestCustomer.lastName);
    await expect(table).toContainText(searchTestCustomer.firstName);
  });
});

test("セイメイ（カナ結合）で前方一致検索できる", async ({
  customersPage,
  searchTestCustomer,
}) => {
  // セイメイ（結合）の前方部分で検索（例: "せいabc12345め" で "せいabc12345めいabc12345" がヒット）
  const fullNameKana = `${searchTestCustomer.lastNameKana}${searchTestCustomer.firstNameKana}`;
  const searchKeyword = fullNameKana.slice(0, -4);

  await test.step("セイメイで検索", async () => {
    await customersPage
      .getByRole("main")
      .getByLabel("キーワード")
      .fill(searchKeyword);
    await customersPage.getByRole("button", { name: "検索" }).click();
    await customersPage.waitForURL("**/customers?keyword=*");
    await expect(
      customersPage.getByRole("main").getByText(/読み込み中/),
    ).toHaveCount(0);
  });

  await test.step("検索結果を確認", async () => {
    const table = customersPage.getByRole("table", { name: "顧客検索結果" });
    await expect(table).toContainText(searchTestCustomer.lastName);
    await expect(table).toContainText(searchTestCustomer.firstName);
  });
});

test("電話番号で前方一致検索できる", async ({
  customersPage,
  searchTestCustomer,
}) => {
  // 電話番号の前方7桁で検索（例: "0901234" で "09012345678" がヒット）※ハイフンなし
  const searchKeyword = searchTestCustomer.phone.slice(0, 7);

  await test.step("電話番号で検索", async () => {
    await customersPage
      .getByRole("main")
      .getByLabel("キーワード")
      .fill(searchKeyword);
    await customersPage.getByRole("button", { name: "検索" }).click();
    await customersPage.waitForURL("**/customers?keyword=*");
    await expect(
      customersPage.getByRole("main").getByText(/読み込み中/),
    ).toHaveCount(0);
  });

  await test.step("検索結果を確認", async () => {
    const table = customersPage.getByRole("table", { name: "顧客検索結果" });
    await expect(table).toContainText(searchTestCustomer.lastName);
    await expect(table).toContainText(searchTestCustomer.firstName);
  });
});

test("メールアドレスで前方一致検索できる", async ({
  customersPage,
  searchTestCustomer,
}) => {
  // メールアドレスの前方5文字で検索（例: "abc12" で "abc12345@example.com" がヒット）
  const searchKeyword = searchTestCustomer.email.slice(0, 5);

  await test.step("メールアドレスで検索", async () => {
    await customersPage
      .getByRole("main")
      .getByLabel("キーワード")
      .fill(searchKeyword);
    await customersPage.getByRole("button", { name: "検索" }).click();
    await customersPage.waitForURL("**/customers?keyword=*");
    await expect(
      customersPage.getByRole("main").getByText(/読み込み中/),
    ).toHaveCount(0);
  });

  await test.step("検索結果を確認", async () => {
    const table = customersPage.getByRole("table", { name: "顧客検索結果" });
    await expect(table).toContainText(searchTestCustomer.lastName);
    await expect(table).toContainText(searchTestCustomer.firstName);
  });
});

test("該当する顧客がいない場合、メッセージが表示される", async ({
  customersPage,
}) => {
  await test.step("存在しないキーワードで検索", async () => {
    await customersPage
      .getByRole("main")
      .getByLabel("キーワード")
      .fill("存在しない顧客");
    await customersPage.getByRole("button", { name: "検索" }).click();
    await customersPage.waitForURL("**/customers?keyword=*");
    await expect(
      customersPage.getByRole("main").getByText(/読み込み中/),
    ).toHaveCount(0);
  });

  await test.step("メッセージを確認", async () => {
    await expect(
      customersPage.getByText("顧客が見つかりませんでした"),
    ).toBeVisible();
  });
});

test("ページネーションが正しく動作する", async ({ customersPage }) => {
  await test.step("1ページ目に20件表示されることを確認", async () => {
    await expect(
      customersPage.getByRole("main").getByText(/読み込み中/),
    ).toHaveCount(0);
    // seedデータは20件以上あるため、他のテストで変更があったとしても 20 件はあることを前提とする
    const rows = customersPage.locator("table tbody tr");
    await expect(rows).toHaveCount(20);
  });

  await test.step("2ページ目をクリック", async () => {
    await customersPage.getByRole("link", { name: /^2$/ }).click();
  });

  await test.step("2ページ目に遷移することを確認", async () => {
    // データは作成系のテストによって変わってしまうので URL が正しいことのみチェック
    // 正しいデータが取得できるかは server の medium テストで担保
    await expect(customersPage).toHaveURL("/customers?page=2");
  });

  await test.step("「前へ」ボタンで1ページ目に戻れることを確認", async () => {
    await customersPage.getByRole("link", { name: "前へ" }).click();
    await customersPage.waitForURL("/customers?page=1");
    const rows = customersPage.locator("table tbody tr");
    await expect(rows).toHaveCount(20);
  });
});

test("検索とページネーションを組み合わせて使用できる", async ({
  customersPage,
  searchPaginationCustomers,
}) => {
  const { keyword } = searchPaginationCustomers;

  await test.step("キーワードで検索して1ページ目を表示", async () => {
    await customersPage
      .getByRole("main")
      .getByLabel("キーワード")
      .fill(keyword);
    await customersPage.getByRole("button", { name: "検索" }).click();
    await customersPage.waitForURL(`**/customers?keyword=${keyword}`);
    await expect(
      customersPage.getByRole("main").getByText(/読み込み中/),
    ).toHaveCount(0);

    // 1ページ目に20件表示されることを確認
    const rows = customersPage.locator("table tbody tr");
    await expect(rows).toHaveCount(20);

    // 表示されている全てのデータがキーワードを含んでいることを確認
    for (let index = 0; index < 20; index++) {
      const row = rows.nth(index);
      const text = await row.textContent();
      expect(text).toContain(keyword);
    }
  });

  await test.step("2ページ目に遷移", async () => {
    await customersPage.getByRole("link", { name: /^2$/ }).click();
    await customersPage.waitForURL(`**/customers?keyword=${keyword}&page=2`);
    await expect(
      customersPage.getByRole("main").getByText(/読み込み中/),
    ).toHaveCount(0);

    // 2ページ目に残り20件が表示されることを確認
    const rows = customersPage.locator("table tbody tr");
    await expect(rows).toHaveCount(20);

    // キーワードが保持されていることを確認
    const searchInput = customersPage
      .getByRole("main")
      .getByLabel("キーワード");
    await expect(searchInput).toHaveValue(keyword);
  });

  await test.step("「前へ」ボタンで1ページ目に戻れることを確認", async () => {
    await customersPage.getByRole("link", { name: "前へ" }).click();
    await customersPage.waitForURL(`**/customers?keyword=${keyword}&page=1`);
    await expect(
      customersPage.getByRole("main").getByText(/読み込み中/),
    ).toHaveCount(0);

    const rows = customersPage.locator("table tbody tr");
    await expect(rows).toHaveCount(20);

    // キーワードが保持されていることを確認
    const searchInput = customersPage
      .getByRole("main")
      .getByLabel("キーワード");
    await expect(searchInput).toHaveValue(keyword);
  });
});
