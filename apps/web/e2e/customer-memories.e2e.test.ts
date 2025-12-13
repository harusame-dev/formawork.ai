import { test as base, expect, type Page } from "@playwright/test";
import { db } from "@workspace/db/client";
import { customersTable } from "@workspace/db/schema/customer";
import {
	customerMemoriesTable,
	MemoryCategory,
} from "@workspace/db/schema/customer-memory";
import { eq } from "drizzle-orm";
import { v4 } from "uuid";

type Fixtures = {
	customerMemoriesPage: Page;
	testCustomer: {
		customerId: string;
	};
};

const test = base.extend<Fixtures>({
	async customerMemoriesPage({ page }, use) {
		const testUser = {
			email: "test1@example.com",
			password: "Test@Pass123",
		};

		await page.goto("/login");
		await page.getByLabel("メールアドレス").fill(testUser.email);
		await page
			.getByRole("textbox", { name: "パスワード" })
			.fill(testUser.password);
		await page.getByRole("button", { name: "ログイン" }).click();
		await page.waitForURL("/");

		await use(page);
	},

	// biome-ignore lint/correctness/noEmptyPattern: fixture requires object destructuring pattern
	async testCustomer({}, use) {
		const customerId = v4();

		await db.insert(customersTable).values({
			address: "",
			birthDate: null,
			customerId,
			email: `${v4()}@example.com`,
			firstName: "ソート確認",
			firstNameKana: "",
			gender: 9,
			lastName: "メモリ",
			lastNameKana: "",
			phone: "000-0000-0000",
			remarks: "",
		});

		await db.insert(customerMemoriesTable).values([
			{
				category: MemoryCategory.Preference,
				content: "趣味趣向B（重要度低）",
				customerId,
				importance: 3,
				isLocked: false,
			},
			{
				category: MemoryCategory.Conversion,
				content: "コンバージョン傾向（単独）",
				customerId,
				importance: 7,
				isLocked: false,
			},
			{
				category: MemoryCategory.Personal,
				content: "パーソナル情報B（重要度低）",
				customerId,
				importance: 5,
				isLocked: false,
			},
			{
				category: MemoryCategory.Preference,
				content: "趣味趣向A（重要度高）",
				customerId,
				importance: 8,
				isLocked: false,
			},
			{
				category: MemoryCategory.Personal,
				content: "パーソナル情報A（重要度高）",
				customerId,
				importance: 9,
				isLocked: false,
			},
		]);

		await use({ customerId });

		await db
			.delete(customersTable)
			.where(eq(customersTable.customerId, customerId));
	},
});

test("メモリがカテゴリ順・重要度順で表示される", async ({
	customerMemoriesPage,
	testCustomer,
}) => {
	// 期待順序: カテゴリ昇順 → 同カテゴリ内で重要度降順
	await customerMemoriesPage.goto(
		`/customers/${testCustomer.customerId}/memories`,
	);
	await expect(customerMemoriesPage.getByRole("table")).toBeVisible();

	const table = customerMemoriesPage.getByRole("table");
	const rows = table.getByRole("row");

	// nth(0) はヘッダー行、nth(1) 以降がデータ行
	// 1行目: パーソナル情報, 重要度9
	const row1 = rows.nth(1);
	await expect(row1).toContainText("パーソナル情報");
	await expect(row1).toContainText("パーソナル情報A（重要度高）");
	await expect(row1).toContainText("9");

	// 2行目: パーソナル情報, 重要度5（同カテゴリ内で重要度が低い）
	const row2 = rows.nth(2);
	await expect(row2).toContainText("パーソナル情報");
	await expect(row2).toContainText("パーソナル情報B（重要度低）");
	await expect(row2).toContainText("5");

	// 3行目: 趣味趣向, 重要度8
	const row3 = rows.nth(3);
	await expect(row3).toContainText("趣味趣向");
	await expect(row3).toContainText("趣味趣向A（重要度高）");
	await expect(row3).toContainText("8");

	// 4行目: 趣味趣向, 重要度3（同カテゴリ内で重要度が低い）
	const row4 = rows.nth(4);
	await expect(row4).toContainText("趣味趣向");
	await expect(row4).toContainText("趣味趣向B（重要度低）");
	await expect(row4).toContainText("3");

	// 5行目: コンバージョン傾向, 重要度7
	const row5 = rows.nth(5);
	await expect(row5).toContainText("コンバージョン傾向");
	await expect(row5).toContainText("コンバージョン傾向（単独）");
	await expect(row5).toContainText("7");
});

test("ロックボタンでメモリをロック・解除できる", async ({
	customerMemoriesPage,
	testCustomer,
}) => {
	await customerMemoriesPage.goto(
		`/customers/${testCustomer.customerId}/memories`,
	);
	await expect(customerMemoriesPage.getByRole("table")).toBeVisible();

	const table = customerMemoriesPage.getByRole("table");
	const rows = table.getByRole("row");

	// 1行目のロックボタンを取得（初期状態は未ロック）
	const row1 = rows.nth(1);
	const lockButton = row1.getByRole("button", { name: "ロック" });
	await expect(lockButton).toBeVisible();

	// ロックボタンをクリック
	await lockButton.click();

	// ロック状態になったことを確認（ボタンのラベルが「ロック解除」に変わる）
	const unlockButton = row1.getByRole("button", { name: "ロック解除" });
	await expect(unlockButton).toBeVisible();

	// 再度クリックして解除
	await unlockButton.click();

	// 未ロック状態に戻ったことを確認
	await expect(row1.getByRole("button", { name: "ロック" })).toBeVisible();
});
