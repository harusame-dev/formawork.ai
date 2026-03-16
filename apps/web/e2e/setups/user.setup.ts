import path from "node:path";
import { expect, test as setup } from "@playwright/test";
import { adminUser, genericUser } from "@repo/supabase/fixtures/users-fixture";

const adminUserAuthFile = path.join(
	import.meta.dirname,
	"../playwright/.auth/admin-user.json",
);
const genericUserAuthFile = path.join(
	import.meta.dirname,
	"../playwright/.auth/generic-user.json",
);

setup("管理者アカウントでログイン", async ({ page }) => {
	await page.goto("/login");
	await page.getByLabel("メールアドレス").fill(adminUser.email);
	await page
		.getByRole("textbox", { name: "パスワード" })
		.fill(adminUser.password);
	await page.getByRole("button", { name: "ログイン" }).click();
	await expect(page).toHaveURL("/events");

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
	await expect(page).toHaveURL("/events");

	await page.context().storageState({
		path: genericUserAuthFile,
	});
});
