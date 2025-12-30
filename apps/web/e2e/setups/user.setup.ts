import { expect, test as setup } from "@playwright/test";
import { adminUser, genericUser } from "@repo/supabase/fixtures/users-fixture";
import { adminUserAuthFile, genericUserAuthFile } from "./auth-file";

setup("管理者アカウントでログイン", async ({ page }) => {
	await page.goto("/login");
	await page.getByLabel("メールアドレス").fill(adminUser.email);
	await page
		.getByRole("textbox", { name: "パスワード" })
		.fill(adminUser.password);
	await page.getByRole("button", { name: "ログイン" }).click();
	await expect(page).toHaveURL("/");

	// オンボーディングをスキップ状態に設定
	await page.evaluate(() => {
		localStorage.setItem("onboarding-completed", "true");
	});

	await page.context().storageState({
		path: adminUserAuthFile,
	});
});

setup("一般アカウントでログイン", async ({ page }) => {
	await page.goto("/login");
	await page.getByLabel("メールアドレス").fill(genericUser.email);
	await page
		.getByRole("textbox", { name: "パスワード" })
		.fill(genericUser.password);
	await page.getByRole("button", { name: "ログイン" }).click();
	await expect(page).toHaveURL("/");

	// オンボーディングをスキップ状態に設定
	await page.evaluate(() => {
		localStorage.setItem("onboarding-completed", "true");
	});

	await page.context().storageState({
		path: genericUserAuthFile,
	});
});
