import { randomUUID } from "node:crypto";
import { expect, type Page } from "@playwright/test";
import { deleteUser } from "@/features/user/delete/delete-user";
import { registerUser } from "@/features/user/register/register-user";
import { testWithAuthenticated } from "./fixtures/authenticated-test";

// シードデータで定義されている管理者ユーザーID（佐藤次郎）
const ADMIN_USER_ID = "00000000-0000-0000-0000-000000000003";

// パスワード変更テストは動的にユーザーを作成する必要があるため、専用のfixtureを使用
const test = testWithAuthenticated.extend<{
	passwordChangePage: Page;
	testUser: {
		email: string;
		password: string;
		userId: string;
	};
}>({
	async passwordChangePage({ browser, testUser }, use) {
		const page = await browser.newContext().then((ctx) => ctx.newPage());

		// ログインページにアクセス
		await page.goto("/login");
		await page.waitForURL("/login");

		// ログイン
		await page.getByLabel("メールアドレス").fill(testUser.email);
		await page
			.getByRole("textbox", { name: "パスワード" })
			.fill(testUser.password);
		await page.getByRole("button", { name: "ログイン" }).click();

		// ホームにリダイレクトされるまで待機
		await page.waitForURL("/");

		// オンボーディングをスキップ状態に設定
		await page.evaluate(() => {
			localStorage.setItem("onboarding-completed", "true");
		});

		// パスワード変更ページに直接アクセス
		await page.goto("/settings/password");
		await page.waitForURL("/settings/password");

		await use(page);
	},
	// biome-ignore lint/correctness/noEmptyPattern: Playwrightのfixtureパターンで使用する標準的な記法
	async testUser({}, use) {
		const uniqueId = randomUUID().slice(0, 8);
		const userData = {
			email: `password-change-test-${uniqueId}@example.com`,
			firstName: "パスワード変更",
			lastName: `テスト${uniqueId}`,
			password: "Test@Pass123",
			role: "user" as const,
		};

		const result = await registerUser(userData);
		if (!result.success) {
			throw new Error(`テストユーザーの登録に失敗: ${result.error}`);
		}

		await use({
			email: userData.email,
			password: userData.password,
			userId: result.data.userId,
		});

		await deleteUser({
			currentUserId: ADMIN_USER_ID,
			userId: result.data.userId,
		});
	},
});

test("ユーザーメニューからパスワード変更ページにアクセスできる", async ({
	pageWithGenericUser: page,
}) => {
	await test.step("ユーザーメニューを開く", async () => {
		await page.getByRole("button", { name: "ユーザーメニューを開く" }).click();
	});

	await test.step("パスワード変更リンクをクリック", async () => {
		await page.getByRole("menuitem", { name: "パスワード変更" }).click();
	});

	await test.step("パスワード変更ページに遷移", async () => {
		await expect(page).toHaveURL("/settings/password");
		await expect(
			page.getByRole("heading", { name: "パスワード変更" }),
		).toBeVisible();
	});
});

test("正しい現在のパスワードと新しいパスワードでパスワードを変更できる", async ({
	passwordChangePage,
	testUser,
}) => {
	const newPassword = "NewPass@456";

	await test.step("現在のパスワードと新しいパスワードを入力", async () => {
		await passwordChangePage
			.getByLabel("現在のパスワード")
			.fill(testUser.password);
		await passwordChangePage.getByLabel("新しいパスワード").fill(newPassword);
	});

	await test.step("パスワードを変更ボタンをクリック", async () => {
		await passwordChangePage
			.getByRole("button", { name: "パスワードを変更" })
			.click();
	});

	await test.step("ホームページにリダイレクトされる", async () => {
		await expect(passwordChangePage).toHaveURL("/");
	});

	await test.step("ログアウトする", async () => {
		// ログアウト機能が未実装のため、クッキーをクリアすることで対応
		await passwordChangePage.context().clearCookies();
		await passwordChangePage.goto("/login");
		await passwordChangePage.waitForURL("/login");
	});

	await test.step("新しいパスワードでログインできることを確認", async () => {
		await passwordChangePage.getByLabel("メールアドレス").fill(testUser.email);
		await passwordChangePage
			.getByRole("textbox", { name: "パスワード" })
			.fill(newPassword);
		await passwordChangePage.getByRole("button", { name: "ログイン" }).click();

		await expect(passwordChangePage).toHaveURL("/");
	});
});

test("現在のパスワードが間違っている場合、エラーメッセージが表示される", async ({
	passwordChangePage,
}) => {
	await test.step("間違った現在のパスワードと新しいパスワードを入力", async () => {
		await passwordChangePage
			.getByLabel("現在のパスワード")
			.fill("Wrong@Pass123");
		await passwordChangePage.getByLabel("新しいパスワード").fill("New@Pass456");
	});

	await test.step("パスワードを変更ボタンをクリック", async () => {
		await passwordChangePage
			.getByRole("button", { name: "パスワードを変更" })
			.click();
	});

	await test.step("エラーメッセージが表示される", async () => {
		await expect(passwordChangePage.getByRole("alert")).toBeVisible();
		await expect(
			passwordChangePage.getByText("現在のパスワードが正しくありません"),
		).toBeVisible();
	});
});

test("キャンセルボタンをクリックすると前のページに戻る", async ({
	pageWithGenericUser: page,
}) => {
	await test.step("ユーザーメニューからパスワード変更ページにアクセス", async () => {
		// ユーザーメニューから遷移（履歴を作成）
		await page.getByRole("button", { name: "ユーザーメニューを開く" }).click();
		await page.getByRole("menuitem", { name: "パスワード変更" }).click();
		await expect(page).toHaveURL("/settings/password");
	});

	await test.step("キャンセルボタンをクリック", async () => {
		await page.getByRole("button", { name: "キャンセル" }).click();
	});

	await test.step("前のページ（ホーム）に戻る", async () => {
		await expect(page).toHaveURL("/");
	});
});
