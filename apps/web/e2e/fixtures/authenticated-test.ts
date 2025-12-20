import { test as base, type Page } from "@playwright/test";
import { adminUserAuthFile, genericUserAuthFile } from "../user.setup";

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
		const page = await browser
			.newContext({
				storageState: adminUserAuthFile,
			})
			.then((context) => context.newPage());

		await page.goto("/");
		await page.waitForURL("/");
		await use(page);
	},
	async pageWithGenericUser({ browser }, use) {
		const page = await browser
			.newContext({
				storageState: genericUserAuthFile,
			})
			.then((context) => context.newPage());

		await page.goto("/");
		await page.waitForURL("/");
		await use(page);
	},
});
