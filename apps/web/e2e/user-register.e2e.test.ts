import { randomUUID } from "node:crypto";
import { expect, type Page } from "@playwright/test";
import { deleteUser } from "@/features/user/delete/delete-user";
import { registerUser } from "@/features/user/register/register-user";
import { testWithAuthenticated } from "./fixtures/authenticated-test";

// シードデータで定義されている管理者スタッフID（佐藤次郎）
const ADMIN_USER_ID = "00000000-0000-0000-0000-000000000003";

const test = testWithAuthenticated.extend<{
	registerUserPage: Page;
	existingUser: {
		email: string;
		userId: string;
	};
}>({
	// biome-ignore lint/correctness/noEmptyPattern: Playwrightのfixtureパターンで使用する標準的な記法
	async existingUser({}, use) {
		const uniqueId = randomUUID().slice(0, 8);
		const userData = {
			email: `existing-user-${uniqueId}@example.com`,
			firstName: "既存",
			lastName: `ユーザー${uniqueId}`,
			password: "ExistingPass123!",
			role: "user" as const,
		};

		const result = await registerUser(userData);
		if (!result.success) {
			throw new Error(`既存ユーザーの登録に失敗: ${result.error}`);
		}

		await use({
			email: userData.email,
			userId: result.data.userId,
		});

		// テスト後にクリーンアップ
		await deleteUser({
			currentUserId: ADMIN_USER_ID,
			userId: result.data.userId,
		});
	},
	registerUserPage: async ({ pageWithAdminUser: page }, use) => {
		await page.goto("/users/new");
		await page.waitForURL("/users/new");

		await expect(page.getByLabel("姓")).not.toBeDisabled();

		await use(page);
	},
});

test("全フィールドを境界値一杯で入力してユーザーを登録し、一覧画面で検索できる", async ({
	registerUserPage,
}) => {
	const uniqueId = randomUUID().slice(0, 8);
	const testData = {
		email: `user-${uniqueId}@example.com`,
		firstName: `太郎${uniqueId}`.slice(0, 24),
		lastName: `テスト${uniqueId}`.slice(0, 24),
		password: "TestPassword123!",
		role: "admin" as const,
	};

	await test.step("フォームに境界値一杯のデータを入力", async () => {
		await registerUserPage.getByLabel("姓").fill(testData.lastName);
		await registerUserPage.getByLabel("名").fill(testData.firstName);
		await registerUserPage.getByLabel("メールアドレス").fill(testData.email);
		await registerUserPage
			.getByRole("textbox", { name: "パスワード" })
			.fill(testData.password);
		await registerUserPage.getByRole("radio", { name: "管理者" }).click();
	});

	await test.step("登録ボタンをクリック", async () => {
		await registerUserPage.getByRole("button", { name: "登録する" }).click();
	});

	await test.step("一覧ページに遷移することを確認", async () => {
		await registerUserPage.waitForURL("/users");
		await expect(
			registerUserPage.getByRole("heading", { name: "ユーザー一覧" }),
		).toBeVisible();
	});

	await test.step("登録したユーザーを姓で検索", async () => {
		await registerUserPage
			.getByRole("main")
			.getByLabel("キーワード")
			.fill(testData.lastName);
		await registerUserPage.getByRole("button", { name: "検索" }).click();
		await registerUserPage.waitForURL("**/users?keyword=*");
		await expect(
			registerUserPage.getByRole("main").getByText("読み込み中"),
		).toBeHidden();
	});

	await test.step("検索結果に登録したユーザーが表示されることを確認", async () => {
		await expect(
			registerUserPage.getByRole("cell", { name: testData.lastName }),
		).toBeVisible();
		await expect(
			registerUserPage.getByRole("cell", { name: testData.firstName }),
		).toBeVisible();
		await expect(registerUserPage.getByText(testData.email)).toBeVisible();
	});
});

test("一般ロールでユーザーを登録できる", async ({ registerUserPage }) => {
	const uniqueId = randomUUID().slice(0, 8);
	const testData = {
		email: `user-${uniqueId}@example.com`,
		firstName: `ユーザー${uniqueId}`.slice(0, 24),
		lastName: `一般${uniqueId}`.slice(0, 24),
		password: "UserPassword123!",
	};

	await test.step("フォームにデータを入力（ロールは一般のまま）", async () => {
		await registerUserPage.getByLabel("姓").fill(testData.lastName);
		await registerUserPage.getByLabel("名").fill(testData.firstName);
		await registerUserPage.getByLabel("メールアドレス").fill(testData.email);
		await registerUserPage
			.getByRole("textbox", { name: "パスワード" })
			.fill(testData.password);
	});

	await test.step("一般ロールが選択されていることを確認", async () => {
		await expect(
			registerUserPage.getByRole("radio", { name: "一般" }),
		).toBeChecked();
	});

	await test.step("登録ボタンをクリック", async () => {
		await registerUserPage.getByRole("button", { name: "登録する" }).click();
	});

	await test.step("一覧ページに遷移することを確認", async () => {
		await registerUserPage.waitForURL("/users");
	});

	await test.step("登録したユーザーを姓で検索", async () => {
		await registerUserPage
			.getByRole("main")
			.getByLabel("キーワード")
			.fill(testData.lastName);
		await registerUserPage.getByRole("button", { name: "検索" }).click();
		await registerUserPage.waitForURL("**/users?keyword=*");
		await expect(
			registerUserPage.getByRole("main").getByText("読み込み中"),
		).toBeHidden();
	});

	await test.step("検索結果に登録したユーザーが表示されることを確認", async () => {
		await expect(
			registerUserPage.getByRole("cell", { name: testData.lastName }),
		).toBeVisible();
		await expect(
			registerUserPage.getByRole("cell", { name: testData.firstName }),
		).toBeVisible();
		await expect(registerUserPage.getByText(testData.email)).toBeVisible();
	});
});

test("重複するメールアドレスで登録するとエラーが表示される", async ({
	registerUserPage,
	existingUser,
}) => {
	const testData = {
		email: existingUser.email,
		firstName: "テスト",
		lastName: "重複",
		password: "TestPassword123!",
	};

	await test.step("既存のメールアドレスでフォームを入力", async () => {
		await registerUserPage.getByLabel("姓").fill(testData.lastName);
		await registerUserPage.getByLabel("名").fill(testData.firstName);
		await registerUserPage.getByLabel("メールアドレス").fill(testData.email);
		await registerUserPage
			.getByRole("textbox", { name: "パスワード" })
			.fill(testData.password);
	});

	await test.step("登録ボタンをクリック", async () => {
		await registerUserPage.getByRole("button", { name: "登録する" }).click();
	});

	await test.step("エラーメッセージが表示されることを確認", async () => {
		await expect(registerUserPage.getByRole("alert")).toBeVisible();
		await expect(
			registerUserPage.getByText("このメールアドレスは既に登録されています"),
		).toBeVisible();
	});

	await test.step("新規登録ページに留まることを確認", async () => {
		await expect(registerUserPage).toHaveURL("/users/new");
	});
});

test("キャンセルボタンで前のページに戻れる", async ({ registerUserPage }) => {
	await test.step("キャンセルボタンをクリック", async () => {
		await registerUserPage.getByRole("button", { name: "キャンセル" }).click();
	});

	await test.step("新規登録ページから離れることを確認", async () => {
		await expect(registerUserPage).not.toHaveURL("/users/new");
	});
});
