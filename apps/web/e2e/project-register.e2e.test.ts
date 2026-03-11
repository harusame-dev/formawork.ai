import { randomUUID } from "node:crypto";
import { expect, type Page } from "@playwright/test";
import { db } from "@workspace/db/client";
import { projectsTable } from "@workspace/db/schema/projects";
import { eq } from "drizzle-orm";
import { testWithAuthenticated } from "./fixtures/authenticated-test";

const test = testWithAuthenticated.extend<{
	registerProjectPage: Page;
}>({
	registerProjectPage: async ({ pageWithAdminUser: page }, use) => {
		await page.goto("/projects/new");
		await page.waitForURL("/projects/new");

		await expect(page.getByLabel("案件名")).not.toBeDisabled();

		await use(page);
	},
});

test("案件を登録して一覧に表示される", async ({ registerProjectPage }) => {
	const uniqueId = randomUUID().slice(0, 8);
	const name = `登録テスト案件${uniqueId}`;

	await test.step("フォームに入力", async () => {
		await registerProjectPage.getByLabel("案件名").fill(name);

		// 担当者選択
		await registerProjectPage.getByRole("combobox").click();
		await registerProjectPage.getByRole("option").first().click();
	});

	await test.step("登録ボタンをクリック", async () => {
		await registerProjectPage.getByRole("button", { name: "登録する" }).click();
	});

	await test.step("案件一覧ページに遷移することを確認", async () => {
		await registerProjectPage.waitForURL("/projects");
		await expect(
			registerProjectPage.getByRole("heading", { name: "案件一覧" }),
		).toBeVisible();
	});

	await test.step("登録した案件が表示されることを確認", async () => {
		await expect(registerProjectPage.getByRole("cell", { name })).toBeVisible();
	});

	// クリーンアップ
	const projects = await db
		.select({ projectId: projectsTable.projectId })
		.from(projectsTable)
		.where(eq(projectsTable.name, name));

	for (const project of projects) {
		await db
			.delete(projectsTable)
			.where(eq(projectsTable.projectId, project.projectId));
	}
});

test("キャンセルボタンで前のページに戻れる", async ({
	registerProjectPage,
}) => {
	await test.step("キャンセルボタンをクリック", async () => {
		await registerProjectPage
			.getByRole("button", { name: "キャンセル" })
			.click();
	});

	await test.step("新規登録ページから離れることを確認", async () => {
		await expect(registerProjectPage).not.toHaveURL("/projects/new");
	});
});
