import { expect, test as setup } from "@playwright/test";
import { adminUserAuthFile, genericUserAuthFile } from "./auth-file";

setup("管理者アカウントでログイン", async ({ page }) => {
	await page.goto("/login");
	await page.getByLabel("メールアドレス").fill("admin@example.com");
	await page.getByRole("textbox", { name: "パスワード" }).fill("Admin@789!");
	await page.getByRole("button", { name: "ログイン" }).click();
	await expect(page).toHaveURL("/");

	await page.context().storageState({
		path: adminUserAuthFile,
	});
});

setup("一般アカウントでログイン", async ({ page }) => {
	await page.goto("/login");
	await page.getByLabel("メールアドレス").fill("generic@example.com");
	await page.getByRole("textbox", { name: "パスワード" }).fill("Secure@456");
	await page.getByRole("button", { name: "ログイン" }).click();
	await expect(page).toHaveURL("/");

	await page.context().storageState({
		path: genericUserAuthFile,
	});
});
