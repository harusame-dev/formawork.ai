import { test as base, expect, type Page } from "@playwright/test";
import { adminUserAuthFile, genericUserAuthFile } from "../setups/auth-file";

export const testWithAuthenticated = base.extend<{
	pageWithAdminUser: Page;
	pageWithGenericUser: Page;
	adminStaffId: string;
}>({
	// biome-ignore lint/correctness/noEmptyPattern: Playwrightのfixtureパターンで使用する標準的な記法
	adminStaffId: async ({}, use) => {
		// シードデータで定義されている管理者スタッフID（佐藤次郎）
		await use("00000000-0000-0000-0000-000000000003");
	},
	async pageWithAdminUser({ browser }, use) {
		const context = await browser.newContext({
			storageState: adminUserAuthFile,
		});
		const page = await context.newPage();

		await page.goto("/");
		// ログインページにリダイレクトされた場合は認証状態が失われているので待機
		await expect(page).toHaveURL("/");
		await use(page);
	},
	async pageWithGenericUser({ browser }, use) {
		const context = await browser.newContext({
			storageState: genericUserAuthFile,
		});
		const page = await context.newPage();

		await page.goto("/");
		// ログインページにリダイレクトされた場合は認証状態が失われているので待機
		await expect(page).toHaveURL("/");
		await use(page);
	},
});
