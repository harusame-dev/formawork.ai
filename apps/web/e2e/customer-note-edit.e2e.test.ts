import { randomUUID } from "node:crypto";
import { expect, type Page } from "@playwright/test";
import { db } from "@workspace/db/client";
import { customersTable } from "@workspace/db/schema/customer";
import { customerNotesTable } from "@workspace/db/schema/customer-note";
import { eq } from "drizzle-orm";
import { testWithAuthenticated } from "./fixtures/authenticated-test";

// スタッフID（supabase seed.ts より）
const GENERIC_USER_STAFF_ID = "00000000-0000-0000-0000-000000000002";

const test = testWithAuthenticated.extend<{
	adminNotesPage: Page;
	genericUserNotesPage: Page;
	noteByGenericUser: { content: string; customerNoteId: string };
	testCustomer: { customerId: string };
}>({
	adminNotesPage: async ({ pageWithAdminUser: page, testCustomer }, use) => {
		await page.goto(`/customers/${testCustomer.customerId}/notes`);
		await page.waitForURL(`/customers/${testCustomer.customerId}/notes`);
		await expect(page.getByText("読み込み中")).toBeHidden();
		await use(page);
	},
	genericUserNotesPage: async (
		{ pageWithGenericUser: page, testCustomer },
		use,
	) => {
		await page.goto(`/customers/${testCustomer.customerId}/notes`);
		await page.waitForURL(`/customers/${testCustomer.customerId}/notes`);
		await expect(page.getByText("読み込み中")).toBeHidden();
		await use(page);
	},
	noteByGenericUser: async ({ testCustomer }, use) => {
		const customerNoteId = randomUUID();
		const content = `Generic ユーザー作成ノート (${customerNoteId})`;

		const serviceDate = new Date().toISOString().slice(0, 10);
		await db.insert(customerNotesTable).values({
			content,
			customerId: testCustomer.customerId,
			customerNoteId,
			serviceDate,
			staffId: GENERIC_USER_STAFF_ID,
		});

		await use({ content, customerNoteId });

		// クリーンアップ（削除されていなければ削除）
		await db
			.delete(customerNotesTable)
			.where(eq(customerNotesTable.customerNoteId, customerNoteId));
	},
	// biome-ignore lint/correctness/noEmptyPattern: Playwrightのfixtureパターンで使用する標準的な記法
	testCustomer: async ({}, use) => {
		const customerId = randomUUID();

		await db.insert(customersTable).values({
			customerId,
			email: `${randomUUID()}@example.com`,
			firstName: "ノート編集テスト",
			lastName: "顧客",
			phone: "000-0000-0000",
		});

		await use({ customerId });

		await db
			.delete(customersTable)
			.where(eq(customersTable.customerId, customerId));
	},
});

test("作成した本人が編集できる", async ({
	genericUserNotesPage: page,
	noteByGenericUser: testNote,
}) => {
	const editedContent = `編集後のノート (${randomUUID()})`;

	await test.step("テストノートが表示されることを確認", async () => {
		await expect(page.getByText(testNote.content)).toBeVisible();
	});

	await test.step("編集ボタンをクリック", async () => {
		const noteCard = page.getByRole("listitem").filter({
			has: page.getByText(testNote.content),
		});

		await noteCard.getByRole("button", { name: "編集" }).click();

		// 編集ダイアログが表示されることを確認
		const dialog = page.getByRole("dialog");
		await expect(
			dialog.getByRole("heading", { name: "ノートを編集" }),
		).toBeVisible();

		// 既存の内容が入力されていることを確認
		await expect(dialog.getByLabel("内容")).toHaveValue(testNote.content);
	});

	await test.step("内容を編集して更新", async () => {
		const dialog = page.getByRole("dialog");
		await dialog.getByLabel("内容").fill(editedContent);
		await dialog.getByRole("button", { name: "更新" }).click();

		// ダイアログが閉じることを確認
		await expect(dialog).toBeHidden();
	});

	await test.step("編集内容が反映されることを確認", async () => {
		// 編集後の内容が一覧に表示されることを確認
		await expect(page.getByText(editedContent)).toBeVisible();

		// 元の内容が表示されないことを確認
		await expect(page.getByText(testNote.content)).toBeHidden();
	});
});

test("管理者が他人のノートを編集できる", async ({
	adminNotesPage: page,
	noteByGenericUser: testNote,
}) => {
	const editedContent = `管理者が編集したノート (${randomUUID()})`;

	await test.step("他人が作成したノートが表示されることを確認", async () => {
		await expect(page.getByText(testNote.content)).toBeVisible();
	});

	await test.step("編集ボタンをクリックして編集", async () => {
		const noteCard = page.getByRole("listitem").filter({
			has: page.getByText(testNote.content),
		});

		// 編集ボタンが表示されることを確認
		const editButton = noteCard.getByRole("button", { name: "編集" });
		await expect(editButton).toBeVisible();

		await editButton.click();

		// 編集ダイアログが表示されることを確認
		const dialog = page.getByRole("dialog");
		await expect(
			dialog.getByRole("heading", { name: "ノートを編集" }),
		).toBeVisible();

		// 内容を編集
		await dialog.getByLabel("内容").fill(editedContent);
		await dialog.getByRole("button", { name: "更新" }).click();

		// ダイアログが閉じることを確認
		await expect(dialog).toBeHidden();
	});

	await test.step("編集内容が反映されることを確認", async () => {
		// 編集後の内容が一覧に表示されることを確認
		await expect(page.getByText(editedContent)).toBeVisible();

		// 元の内容が表示されないことを確認
		await expect(page.getByText(testNote.content)).toBeHidden();
	});
});
