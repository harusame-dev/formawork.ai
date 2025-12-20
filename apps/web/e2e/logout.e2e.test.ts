import { expect } from "@playwright/test";
import { testWithAuthenticated } from "./fixtures/authenticated-test";

const test = testWithAuthenticated;

test("ログイン後、ログアウトするとログインページにリダイレクトされ、バックしてもホームに戻らない", async ({
	pageWithAdminUser,
}) => {
	await test.step("ユーザーメニューを開く", async () => {
		await pageWithAdminUser
			.getByRole("button", { name: "ユーザーメニューを開く" })
			.click();
	});

	await test.step("ログアウトボタンをクリックしてログインページにリダイレクトされることを確認", async () => {
		await pageWithAdminUser.getByRole("button", { name: "ログアウト" }).click();
		await pageWithAdminUser.waitForURL("/login");
	});

	await test.step("ブラウザバックしてもホームページに戻らないことを確認", async () => {
		await pageWithAdminUser.goBack();
		// RedirectType.replace を使用しているため、ホームページには戻らない
		await expect(pageWithAdminUser).not.toHaveURL("/");
	});
});
