/**
 * ユーザー編集E2Eテスト
 *
 * このテストではユーザーデータを変更するため、testWithAuthenticated は使用せず
 * 独自のフィクスチャでテスト用ユーザーを作成・削除しています。
 */
import { randomUUID } from "node:crypto";
import { test as base, expect, type Page } from "@playwright/test";
import { deleteUser } from "@/features/user/delete/delete-user";
import { registerUser } from "@/features/user/register/register-user";

type UserFixture = {
	email: string;
	firstName: string;
	lastName: string;
	password: string;
	role: "admin" | "user";
	userId: string;
};

const test = base.extend<{
	adminRoleUser: UserFixture;
	editUserPage: Page;
	genericRoleUser: UserFixture;
	pageWithAdminUser: Page;
	pageWithGenericUser: Page;
}>({
	// biome-ignore lint/correctness/noEmptyPattern: Playwrightのfixtureパターンで使用する標準的な記法
	async adminRoleUser({}, use) {
		const uniqueId = randomUUID().slice(0, 8);
		const userData = {
			email: `admin-edit-test-${uniqueId}@example.com`,
			firstName: `管理者${uniqueId}`,
			lastName: `テスト${uniqueId}`,
			password: "AdminTest@123",
			role: "admin" as const,
		};

		const result = await registerUser(userData);
		if (!result.success) {
			throw new Error(`管理者テストユーザーの登録に失敗: ${result.error}`);
		}

		await use({
			email: userData.email,
			firstName: userData.firstName,
			lastName: userData.lastName,
			password: userData.password,
			role: userData.role,
			userId: result.data.userId,
		});

		await deleteUser({
			currentUserId: result.data.userId,
			userId: result.data.userId,
		});
	},
	editUserPage: async ({ pageWithAdminUser: page, genericRoleUser }, use) => {
		await page.goto(`/users/${genericRoleUser.userId}/edit`);
		await page.waitForURL(`/users/${genericRoleUser.userId}/edit`);
		const main = page.getByRole("main");
		await expect(main.getByLabel("姓")).not.toBeDisabled();

		await use(page);
	},
	async genericRoleUser({ adminRoleUser }, use) {
		const uniqueId = randomUUID().slice(0, 8);
		const userData = {
			email: `edit-test-${uniqueId}@example.com`,
			firstName: `編集用${uniqueId}`,
			lastName: `テスト${uniqueId}`,
			password: "EditTest@123",
			role: "user" as const,
		};

		const result = await registerUser(userData);
		if (!result.success) {
			throw new Error(`テストユーザーの登録に失敗: ${result.error}`);
		}

		await use({
			email: userData.email,
			firstName: userData.firstName,
			lastName: userData.lastName,
			password: userData.password,
			role: userData.role,
			userId: result.data.userId,
		});

		await deleteUser({
			currentUserId: adminRoleUser.userId,
			userId: result.data.userId,
		});
	},
	async pageWithAdminUser({ browser, adminRoleUser }, use) {
		const context = await browser.newContext();
		const page = await context.newPage();

		await page.goto("/login");
		await page.getByLabel("メールアドレス").fill(adminRoleUser.email);
		await page
			.getByRole("textbox", { name: "パスワード" })
			.fill(adminRoleUser.password);
		await page.getByRole("button", { name: "ログイン" }).click();
		await expect(page).toHaveURL("/");

		await use(page);
	},
	async pageWithGenericUser({ browser, genericRoleUser }, use) {
		const context = await browser.newContext();
		const page = await context.newPage();

		await page.goto("/login");
		await page.getByLabel("メールアドレス").fill(genericRoleUser.email);
		await page
			.getByRole("textbox", { name: "パスワード" })
			.fill(genericRoleUser.password);
		await page.getByRole("button", { name: "ログイン" }).click();
		await expect(page).toHaveURL("/");

		await use(page);
	},
});

test("自分自身の編集画面ではロール変更ができない", async ({
	pageWithAdminUser: page,
	adminRoleUser,
}) => {
	const main = page.getByRole("main");

	await test.step("自分自身の編集ページに遷移", async () => {
		await page.goto(`/users/${adminRoleUser.userId}/edit`);
		await page.waitForURL(`/users/${adminRoleUser.userId}/edit`);
		await expect(main.getByLabel("姓")).not.toBeDisabled();
	});

	await test.step("ロール変更ができないことを確認", async () => {
		await expect(main.getByRole("radio", { name: "一般" })).toBeDisabled();
		await expect(main.getByRole("radio", { name: "管理者" })).toBeDisabled();
	});
});

test("他のユーザーの全入力内容を変更して反映される", async ({
	editUserPage: page,
	genericRoleUser,
}) => {
	const main = page.getByRole("main");
	const uniqueId = randomUUID().slice(0, 8);
	const updatedEmail = `updated-${uniqueId}@example.com`;
	const updatedFirstName = `更新後名${uniqueId}`.slice(0, 24);
	const updatedLastName = `更新後姓${uniqueId}`.slice(0, 24);

	await test.step("現在の値が表示されていることを確認", async () => {
		await expect(main.getByLabel("姓")).toHaveValue(genericRoleUser.lastName);
		await expect(main.getByLabel("名")).toHaveValue(genericRoleUser.firstName);
		await expect(main.getByLabel("メールアドレス")).toHaveValue(
			genericRoleUser.email,
		);
		await expect(main.getByRole("radio", { name: "一般" })).toBeChecked();
	});

	await test.step("全フィールドを変更", async () => {
		await main.getByLabel("姓").fill(updatedLastName);
		await main.getByLabel("名").fill(updatedFirstName);
		await main.getByLabel("メールアドレス").fill(updatedEmail);
		await main.getByRole("radio", { name: "管理者" }).click();
	});

	await test.step("編集ボタンをクリック", async () => {
		await main.getByRole("button", { name: "編集する" }).click();
	});

	await test.step("詳細ページに遷移することを確認", async () => {
		await page.waitForURL(`/users/${genericRoleUser.userId}`);
	});

	await test.step("変更内容が反映されていることを確認", async () => {
		await expect(
			main.getByRole("heading", {
				name: `${updatedLastName} ${updatedFirstName}`,
			}),
		).toBeVisible();
		await expect(
			main.getByRole("row", { name: "メールアドレス" }).getByText(updatedEmail),
		).toBeVisible();
		await expect(
			main.getByRole("row", { name: "ロール" }).getByText("管理者"),
		).toBeVisible();
	});
});
