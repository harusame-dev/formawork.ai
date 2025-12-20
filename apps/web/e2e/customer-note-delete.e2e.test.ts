import { randomUUID } from "node:crypto";
import { expect, type Page } from "@playwright/test";
import { db } from "@workspace/db/client";
import { customersTable } from "@workspace/db/schema/customer";
import { customerNotesTable } from "@workspace/db/schema/customer-note";
import { eq } from "drizzle-orm";
import { testWithAuthenticated } from "./fixtures/authenticated-test";

// スタッフID（supabase seed.ts より）
const GENERIC_USER_STAFF_ID = "00000000-0000-0000-0000-000000000002";
const TEST1_USER_STAFF_ID = "00000000-0000-0000-0000-000000000001";

const test = testWithAuthenticated.extend<{
	adminNotesPage: Page;
	genericUserNotesPage: Page;
	noteByGenericUser: { content: string; customerNoteId: string };
	noteByTest1User: { content: string; customerNoteId: string };
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
	noteByTest1User: async ({ testCustomer }, use) => {
		const customerNoteId = randomUUID();
		const content = `Test1 ユーザー作成ノート (${customerNoteId})`;

		const serviceDate = new Date().toISOString().slice(0, 10);
		await db.insert(customerNotesTable).values({
			content,
			customerId: testCustomer.customerId,
			customerNoteId,
			serviceDate,
			staffId: TEST1_USER_STAFF_ID,
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
			firstName: "ノート削除テスト",
			lastName: "顧客",
			phone: "000-0000-0000",
		});

		await use({ customerId });

		await db
			.delete(customersTable)
			.where(eq(customersTable.customerId, customerId));
	},
});

test("作成した本人が削除できる", async ({
	genericUserNotesPage: page,
	noteByGenericUser: testNote,
}) => {
	await test.step("テストノートが表示されることを確認", async () => {
		await expect(page.getByText(testNote.content)).toBeVisible();
	});

	await test.step("削除ボタンをクリック", async () => {
		const noteCard = page.getByRole("listitem").filter({
			has: page.getByText(testNote.content),
		});

		await noteCard.getByRole("button", { name: "削除" }).click();

		// 削除確認ダイアログが表示されることを確認
		const dialog = page.getByRole("dialog");
		await expect(
			dialog.getByRole("heading", { name: "ノートを削除" }),
		).toBeVisible();
		await expect(
			dialog.getByText(
				"このノートを削除してもよろしいですか？この操作は取り消せません。",
			),
		).toBeVisible();
	});

	await test.step("確認ダイアログでOKをクリック", async () => {
		const dialog = page.getByRole("dialog");
		await dialog.getByRole("button", { name: "削除" }).click();

		// ダイアログが閉じることを確認
		await expect(dialog).toBeHidden();
	});

	await test.step("ノートが削除されることを確認", async () => {
		// 削除したノートが一覧に表示されないことを確認
		await expect(page.getByText(testNote.content)).toBeHidden();
	});
});

test("管理者が他人のノートを削除できる", async ({
	adminNotesPage: page,
	noteByGenericUser: testNote,
}) => {
	await test.step("他人が作成したノートが表示されることを確認", async () => {
		await expect(page.getByText(testNote.content)).toBeVisible();
	});

	await test.step("削除ボタンをクリックして削除", async () => {
		const noteCard = page.getByRole("listitem").filter({
			has: page.getByText(testNote.content),
		});

		// 削除ボタンが表示されることを確認
		const deleteButton = noteCard.getByRole("button", { name: "削除" });
		await expect(deleteButton).toBeVisible();

		await deleteButton.click();

		// 削除確認ダイアログが表示されることを確認
		const dialog = page.getByRole("dialog");
		await expect(
			dialog.getByRole("heading", { name: "ノートを削除" }),
		).toBeVisible();

		// 削除実行
		await dialog.getByRole("button", { name: "削除" }).click();

		// ダイアログが閉じることを確認
		await expect(dialog).toBeHidden();
	});

	await test.step("ノートが削除されることを確認", async () => {
		// 削除したノートが一覧に表示されないことを確認
		await expect(page.getByText(testNote.content)).toBeHidden();
	});
});

test("管理者じゃない別ユーザーには削除ボタンが表示されない", async ({
	genericUserNotesPage: page,
	noteByTest1User: testNote,
}) => {
	await test.step("test1 が作成したノートが表示されることを確認", async () => {
		await expect(page.getByText(testNote.content)).toBeVisible();
	});

	await test.step("削除ボタンと編集ボタンが表示されないことを確認", async () => {
		const noteCard = page.getByRole("listitem").filter({
			has: page.getByText(testNote.content),
		});

		// ノートが表示されることを確認
		await expect(noteCard).toBeVisible();

		// 削除ボタンが表示されないことを確認
		await expect(noteCard.getByRole("button", { name: "削除" })).toBeHidden();

		// 編集ボタンも表示されないことを確認
		await expect(noteCard.getByRole("button", { name: "編集" })).toBeHidden();
	});
});
