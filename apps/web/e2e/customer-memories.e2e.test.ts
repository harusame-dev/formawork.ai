import { randomUUID } from "node:crypto";
import { expect, type Page } from "@playwright/test";
import { db } from "@workspace/db/client";
import { customersTable } from "@workspace/db/schema/customer";
import {
	customerMemoriesTable,
	MemoryCategory,
} from "@workspace/db/schema/customer-memory";
import { eq } from "drizzle-orm";
import { testWithAuthenticated } from "./fixtures/authenticated-test";

const test = testWithAuthenticated.extend<{
	customerMemoriesPage: Page;
	testCustomer: {
		customerId: string;
	};
}>({
	customerMemoriesPage: async (
		{ pageWithGenericUser: page, testCustomer },
		use,
	) => {
		await page.goto(`/customers/${testCustomer.customerId}/memories`);
		await expect(page.getByRole("table")).toBeVisible();
		await use(page);
	},
	// biome-ignore lint/correctness/noEmptyPattern: Playwrightのfixtureパターンで使用する標準的な記法
	async testCustomer({}, use) {
		const customerId = randomUUID();

		await db.insert(customersTable).values({
			address: "",
			birthDate: null,
			customerId,
			email: `${randomUUID()}@example.com`,
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
				isProtected: false,
			},
			{
				category: MemoryCategory.Conversion,
				content: "コンバージョン傾向（単独）",
				customerId,
				importance: 7,
				isProtected: false,
			},
			{
				category: MemoryCategory.Personal,
				content: "パーソナル情報B（重要度低）",
				customerId,
				importance: 5,
				isProtected: false,
			},
			{
				category: MemoryCategory.Preference,
				content: "趣味趣向A（重要度高）",
				customerId,
				importance: 8,
				isProtected: false,
			},
			{
				category: MemoryCategory.Personal,
				content: "パーソナル情報A（重要度高）",
				customerId,
				importance: 9,
				isProtected: false,
			},
		]);

		await use({ customerId });

		await db
			.delete(customersTable)
			.where(eq(customersTable.customerId, customerId));
	},
});

test("メモリがカテゴリ順・重要度順で表示される", async ({
	customerMemoriesPage: page,
}) => {
	// 期待順序: カテゴリ昇順 → 同カテゴリ内で重要度降順
	const table = page.getByRole("table");
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

test("保護ボタンでメモリを保護・解除できる", async ({
	customerMemoriesPage: page,
}) => {
	const table = page.getByRole("table");
	const rows = table.getByRole("row");

	// 1行目の保護ボタンを取得（初期状態は未保護）
	const row1 = rows.nth(1);
	const lockButton = row1.getByRole("button", { name: "保護" });
	await expect(lockButton).toBeVisible();

	// 保護ボタンをクリック
	await lockButton.click();

	// 保護状態になったことを確認（ボタンのラベルが「保護解除」に変わる）
	const unlockButton = row1.getByRole("button", { name: "保護解除" });
	await expect(unlockButton).toBeVisible();

	// 再度クリックして解除
	await unlockButton.click();

	// 未保護状態に戻ったことを確認
	await expect(row1.getByRole("button", { name: "保護" })).toBeVisible();
});

test("メモリを登録・編集・削除できる", async ({
	customerMemoriesPage: page,
}) => {
	const registerContent = `E2Eテスト用メモリ-${randomUUID()}`;
	const registerImportance = "8";
	const editContent = `編集後の内容-${randomUUID()}`;
	const editImportance = "10";

	await test.step("登録ダイアログを開く", async () => {
		await page.getByRole("button", { name: "メモリを追加" }).click();
		await expect(page.getByRole("dialog")).toBeVisible();
	});

	await test.step("登録フォームに入力する", async () => {
		const dialog = page.getByRole("dialog");
		await dialog.getByLabel("カテゴリ").click();
		await page.getByRole("option", { name: "健康・身体的配慮" }).click();
		await dialog.getByLabel("内容").fill(registerContent);
		await dialog.getByLabel("重要度").fill(registerImportance);
	});

	await test.step("登録を実行し、登録されたことを確認する", async () => {
		await page.getByRole("button", { name: "登録" }).click();
		await expect(page.getByRole("dialog")).not.toBeVisible();
		await expect(page.getByText(registerContent)).toBeVisible();
	});

	await test.step("編集ダイアログを開く", async () => {
		const table = page.getByRole("table");
		const rows = table.getByRole("row");
		const targetRow = rows.filter({ hasText: registerContent }).first();
		await targetRow.getByRole("button", { name: "編集" }).click();
		await expect(page.getByRole("dialog")).toBeVisible();
	});

	await test.step("編集フォームを入力する", async () => {
		const dialog = page.getByRole("dialog");
		await dialog.getByLabel("内容").fill(editContent);
		await dialog.getByLabel("重要度").fill(editImportance);
	});

	await test.step("更新を実行し、更新されたことを確認する", async () => {
		await page.getByRole("button", { name: "更新" }).click();
		await expect(page.getByRole("dialog")).not.toBeVisible();
		await expect(page.getByText(editContent)).toBeVisible();
	});

	await test.step("削除確認ダイアログを開く", async () => {
		const table = page.getByRole("table");
		const rows = table.getByRole("row");
		const editedRow = rows.filter({ hasText: editContent }).first();
		await editedRow.getByRole("button", { name: "削除" }).click();
		await expect(page.getByRole("dialog")).toBeVisible();
	});

	await test.step("削除を実行し、削除されたことを確認する", async () => {
		await page
			.getByRole("dialog")
			.getByRole("button", { name: "削除" })
			.click();
		await expect(page.getByRole("dialog")).not.toBeVisible();
		await expect(page.getByText(editContent)).not.toBeVisible();
	});
});
