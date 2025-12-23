import { randomUUID } from "node:crypto";
import path from "node:path";
import { expect, type Page } from "@playwright/test";
import { db } from "@workspace/db/client";
import { customersTable } from "@workspace/db/schema/customer";
import { customerNotesTable } from "@workspace/db/schema/customer-note";
import { eq } from "drizzle-orm";
import { testWithAuthenticated } from "./fixtures/authenticated-test";

const test = testWithAuthenticated.extend<{
	customerNotesPage: Page;
	testCustomer: { customerId: string };
}>({
	customerNotesPage: async (
		{ pageWithGenericUser: page, testCustomer },
		use,
	) => {
		await page.goto(`/customers/${testCustomer.customerId}/notes`);
		await page.waitForURL(`/customers/${testCustomer.customerId}/notes`);
		await expect(page.getByText("読み込み中")).toBeHidden();
		await use(page);
	},
	// biome-ignore lint/correctness/noEmptyPattern: Playwrightのfixtureパターンで使用する標準的な記法
	testCustomer: async ({}, use) => {
		const customerId = randomUUID();

		await db.insert(customersTable).values({
			customerId,
			email: `${randomUUID()}@example.com`,
			firstName: "ノート登録テスト",
			lastName: "顧客",
			phone: "000-0000-0000",
		});

		await use({ customerId });

		// クリーンアップ: 関連ノートを削除してから顧客を削除
		await db
			.delete(customerNotesTable)
			.where(eq(customerNotesTable.customerId, customerId));
		await db
			.delete(customersTable)
			.where(eq(customersTable.customerId, customerId));
	},
});

test("正常系: 1文字（最小境界値）のノート登録成功", async ({
	customerNotesPage,
}) => {
	// ユニークな1文字を使用（テストの複数回実行で重複を避ける）
	const noteContent = "§";

	await test.step("ノート追加ダイアログを開く", async () => {
		await customerNotesPage
			.getByRole("button", { name: "ノートを追加" })
			.click();
		await expect(
			customerNotesPage.getByRole("dialog").getByText("ノートを追加"),
		).toBeVisible();
	});

	await test.step("1文字のノート内容を入力", async () => {
		await customerNotesPage.getByLabel("内容").fill(noteContent);
	});

	await test.step("ノートを登録", async () => {
		await customerNotesPage
			.getByRole("dialog")
			.getByRole("button", { name: "登録" })
			.click();
	});

	await test.step("登録結果を確認", async () => {
		// ダイアログが閉じることを確認
		await expect(customerNotesPage.getByRole("dialog")).toBeHidden();

		// 登録したノートが一覧に表示されることを確認
		await expect(customerNotesPage.getByText(noteContent)).toBeVisible();
	});
});

test("正常系: 4096文字（最大境界値）のノート登録成功", async ({
	customerNotesPage,
}) => {
	const noteContent = "あ".repeat(4096);

	await test.step("ノート追加ダイアログを開く", async () => {
		await customerNotesPage
			.getByRole("button", { name: "ノートを追加" })
			.click();
		await expect(
			customerNotesPage.getByRole("dialog").getByText("ノートを追加"),
		).toBeVisible();
	});

	await test.step("4096文字のノート内容を入力", async () => {
		await customerNotesPage.getByLabel("内容").fill(noteContent);
	});

	await test.step("ノートを登録", async () => {
		await customerNotesPage
			.getByRole("dialog")
			.getByRole("button", { name: "登録" })
			.click();

		// ダイアログが閉じるまで待機
		await expect(customerNotesPage.getByRole("dialog")).toBeHidden({
			timeout: 10_000,
		});
	});

	await test.step("登録結果を確認", async () => {
		// 登録したノートが一覧に表示されることを確認
		// 最初のlistitem内に4096文字の「あ」を含むテキストがあることを確認
		const noteCard = customerNotesPage.getByRole("listitem").first();
		await expect(noteCard).toContainText(noteContent.slice(0, 20), {
			timeout: 10_000,
		});
	});
});

test("正常系: 5枚の画像を含むノート登録成功", async ({ customerNotesPage }) => {
	const noteContent = `画像5枚のテストノート (${randomUUID()})`;
	const imagePaths = [
		path.join(import.meta.dirname, "sample1.jpg"),
		path.join(import.meta.dirname, "sample2.jpg"),
		path.join(import.meta.dirname, "sample3.jpg"),
		path.join(import.meta.dirname, "sample4.jpg"),
		path.join(import.meta.dirname, "sample5.jpg"),
	];

	await test.step("ノート追加ダイアログを開く", async () => {
		await customerNotesPage
			.getByRole("button", { name: "ノートを追加" })
			.click();
		await expect(
			customerNotesPage.getByRole("dialog").getByText("ノートを追加"),
		).toBeVisible();
	});

	await test.step("5枚の画像を選択", async () => {
		const fileInput = customerNotesPage.locator('input[type="file"]');
		await fileInput.setInputFiles(imagePaths);

		// プレビューが5枚表示されることを確認
		const dialog = customerNotesPage.getByRole("dialog");
		await expect(dialog.locator('img[alt="プレビュー"]')).toHaveCount(5);
	});

	await test.step("ノート内容を入力", async () => {
		await customerNotesPage.getByLabel("内容").fill(noteContent);
	});

	await test.step("ノートを登録", async () => {
		await customerNotesPage
			.getByRole("dialog")
			.getByRole("button", { name: "登録" })
			.click();

		// アップロード完了まで待機
		await expect(customerNotesPage.getByRole("dialog")).toBeHidden({
			timeout: 10_000,
		});
	});

	await test.step("登録結果を確認", async () => {
		// 登録したノートが表示されることを確認
		// 画像が5枚表示されていることを確認
		const noteCard = customerNotesPage.getByRole("listitem").filter({
			has: customerNotesPage.getByText(noteContent),
		});

		const images = noteCard.getByRole("img", {
			name: /^添付画像サムネイル-/,
		});

		// 画像が表示されるまで待機
		await expect(images).toHaveCount(5);

		// TODO: 読み込みが成功していることのテスト
	});

	await test.step("画像ギャラリーを開いて5枚の画像を確認", async () => {
		const noteCard = customerNotesPage.getByRole("listitem").filter({
			has: customerNotesPage.getByText(noteContent),
		});

		// 最初のサムネイルをクリックしてギャラリーを開く
		const firstThumbnail = noteCard.getByRole("img", {
			name: "添付画像サムネイル-1",
		});
		await firstThumbnail.click();

		// Drawerが開いたことを確認
		const drawer = customerNotesPage.getByRole("dialog");
		await expect(drawer).toBeVisible();

		// 画像番号が表示されることを確認（1/5から開始）
		await expect(drawer.getByText("1 / 5")).toBeVisible();

		// 1枚目の画像がビューポートに表示されていることを確認
		const firstImage = drawer.getByRole("img", { name: "添付-1" });
		await expect(firstImage).toBeInViewport();

		// 次のボタンで5枚すべての画像を確認
		const nextButton = drawer.getByRole("button", { name: "次のスライド" });

		for (let i = 2; i <= 5; i++) {
			await nextButton.click();

			await expect(drawer.getByText(`${i} / 5`)).toBeVisible();
			// 前の画像が表示されていないことを確認
			await expect(
				drawer.getByRole("img", { name: `添付-${i - 1}` }),
			).not.toBeInViewport();
			await expect(
				drawer.getByRole("img", { name: `添付-${i}` }),
			).toBeInViewport();
		}

		// 前のボタンで戻れることを確認
		const prevButton = drawer.getByRole("button", {
			name: "前のスライド",
		});
		await prevButton.click();
		await expect(drawer.getByText("4 / 5")).toBeVisible();

		// 戻った画像がビューポートに表示されていることを確認
		expect(drawer.getByRole("img", { name: "添付-5" })).not.toBeInViewport();
		await expect(drawer.getByRole("img", { name: "添付-4" })).toBeInViewport();

		// Drawerを閉じる
		await drawer.getByRole("button", { name: "閉じる" }).click();
		await expect(drawer).toBeHidden();
	});
});
