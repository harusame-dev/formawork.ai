import { randomUUID } from "node:crypto";
import { expect, type Page } from "@playwright/test";
import { deleteStaff } from "@/features/staff/delete/delete-staff";
import { registerStaff } from "@/features/staff/register/register-staff";
import { testWithAuthenticated } from "./fixtures/authenticated-test";

// シードデータで定義されている管理者スタッフID（佐藤次郎）
const ADMIN_STAFF_ID = "00000000-0000-0000-0000-000000000003";

const test = testWithAuthenticated.extend<{
	registerStaffPage: Page;
	existingStaff: {
		email: string;
		staffId: string;
	};
}>({
	// biome-ignore lint/correctness/noEmptyPattern: Playwrightのfixtureパターンで使用する標準的な記法
	async existingStaff({}, use) {
		const uniqueId = randomUUID().slice(0, 8);
		const staffData = {
			email: `existing-staff-${uniqueId}@example.com`,
			firstName: "既存",
			lastName: `スタッフ${uniqueId}`,
			password: "ExistingPass123!",
			role: "user" as const,
		};

		const result = await registerStaff(staffData);
		if (!result.success) {
			throw new Error(`既存スタッフの登録に失敗: ${result.error}`);
		}

		await use({
			email: staffData.email,
			staffId: result.data.staffId,
		});

		// テスト後にクリーンアップ
		await deleteStaff({
			currentUserStaffId: ADMIN_STAFF_ID,
			staffId: result.data.staffId,
		});
	},
	registerStaffPage: async ({ pageWithAdminUser: page }, use) => {
		await page.goto("/staffs/new");
		await page.waitForURL("/staffs/new");

		await expect(page.getByLabel("姓")).not.toBeDisabled();

		await use(page);
	},
});

test("全フィールドを境界値一杯で入力してスタッフを登録し、一覧画面で検索できる", async ({
	registerStaffPage,
}) => {
	const uniqueId = randomUUID().slice(0, 8);
	const testData = {
		email: `staff-${uniqueId}@example.com`,
		firstName: `太郎${uniqueId}`.slice(0, 24),
		lastName: `テスト${uniqueId}`.slice(0, 24),
		password: "TestPassword123!",
		role: "admin" as const,
	};

	await test.step("フォームに境界値一杯のデータを入力", async () => {
		await registerStaffPage.getByLabel("姓").fill(testData.lastName);
		await registerStaffPage.getByLabel("名").fill(testData.firstName);
		await registerStaffPage.getByLabel("メールアドレス").fill(testData.email);
		await registerStaffPage
			.getByRole("textbox", { name: "パスワード" })
			.fill(testData.password);
		await registerStaffPage.getByRole("radio", { name: "管理者" }).click();
	});

	await test.step("登録ボタンをクリック", async () => {
		await registerStaffPage.getByRole("button", { name: "登録する" }).click();
	});

	await test.step("一覧ページに遷移することを確認", async () => {
		await registerStaffPage.waitForURL("/staffs");
		await expect(
			registerStaffPage.getByRole("heading", { name: "スタッフ一覧" }),
		).toBeVisible();
	});

	await test.step("登録したスタッフを姓で検索", async () => {
		await registerStaffPage.getByLabel("キーワード").fill(testData.lastName);
		await registerStaffPage.getByRole("button", { name: "検索" }).click();
		await registerStaffPage.waitForURL("**/staffs?keyword=*");
		await expect(
			registerStaffPage.getByRole("main").getByText("読み込み中"),
		).toBeHidden();
	});

	await test.step("検索結果に登録したスタッフが表示されることを確認", async () => {
		await expect(
			registerStaffPage.getByRole("cell", { name: testData.lastName }),
		).toBeVisible();
		await expect(
			registerStaffPage.getByRole("cell", { name: testData.firstName }),
		).toBeVisible();
		await expect(registerStaffPage.getByText(testData.email)).toBeVisible();
	});
});

test("一般ロールでスタッフを登録できる", async ({ registerStaffPage }) => {
	const uniqueId = randomUUID().slice(0, 8);
	const testData = {
		email: `user-${uniqueId}@example.com`,
		firstName: `ユーザー${uniqueId}`.slice(0, 24),
		lastName: `一般${uniqueId}`.slice(0, 24),
		password: "UserPassword123!",
	};

	await test.step("フォームにデータを入力（ロールは一般のまま）", async () => {
		await registerStaffPage.getByLabel("姓").fill(testData.lastName);
		await registerStaffPage.getByLabel("名").fill(testData.firstName);
		await registerStaffPage.getByLabel("メールアドレス").fill(testData.email);
		await registerStaffPage
			.getByRole("textbox", { name: "パスワード" })
			.fill(testData.password);
	});

	await test.step("一般ロールが選択されていることを確認", async () => {
		await expect(
			registerStaffPage.getByRole("radio", { name: "一般" }),
		).toBeChecked();
	});

	await test.step("登録ボタンをクリック", async () => {
		await registerStaffPage.getByRole("button", { name: "登録する" }).click();
	});

	await test.step("一覧ページに遷移することを確認", async () => {
		await registerStaffPage.waitForURL("/staffs");
	});

	await test.step("登録したスタッフを姓で検索", async () => {
		await registerStaffPage.getByLabel("キーワード").fill(testData.lastName);
		await registerStaffPage.getByRole("button", { name: "検索" }).click();
		await registerStaffPage.waitForURL("**/staffs?keyword=*");
		await expect(
			registerStaffPage.getByRole("main").getByText("読み込み中"),
		).toBeHidden();
	});

	await test.step("検索結果に登録したスタッフが表示されることを確認", async () => {
		await expect(
			registerStaffPage.getByRole("cell", { name: testData.lastName }),
		).toBeVisible();
		await expect(
			registerStaffPage.getByRole("cell", { name: testData.firstName }),
		).toBeVisible();
		await expect(registerStaffPage.getByText(testData.email)).toBeVisible();
	});
});

test("重複するメールアドレスで登録するとエラーが表示される", async ({
	registerStaffPage,
	existingStaff,
}) => {
	const testData = {
		email: existingStaff.email,
		firstName: "テスト",
		lastName: "重複",
		password: "TestPassword123!",
	};

	await test.step("既存のメールアドレスでフォームを入力", async () => {
		await registerStaffPage.getByLabel("姓").fill(testData.lastName);
		await registerStaffPage.getByLabel("名").fill(testData.firstName);
		await registerStaffPage.getByLabel("メールアドレス").fill(testData.email);
		await registerStaffPage
			.getByRole("textbox", { name: "パスワード" })
			.fill(testData.password);
	});

	await test.step("登録ボタンをクリック", async () => {
		await registerStaffPage.getByRole("button", { name: "登録する" }).click();
	});

	await test.step("エラーメッセージが表示されることを確認", async () => {
		await expect(registerStaffPage.getByRole("alert")).toBeVisible();
		await expect(
			registerStaffPage.getByText("このメールアドレスは既に登録されています"),
		).toBeVisible();
	});

	await test.step("新規登録ページに留まることを確認", async () => {
		await expect(registerStaffPage).toHaveURL("/staffs/new");
	});
});

test("キャンセルボタンで前のページに戻れる", async ({ registerStaffPage }) => {
	await test.step("キャンセルボタンをクリック", async () => {
		await registerStaffPage.getByRole("button", { name: "キャンセル" }).click();
	});

	await test.step("新規登録ページから離れることを確認", async () => {
		await expect(registerStaffPage).not.toHaveURL("/staffs/new");
	});
});
