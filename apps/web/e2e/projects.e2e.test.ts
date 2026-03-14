import { randomUUID } from "node:crypto";
import { expect, type Page } from "@playwright/test";
import { db } from "@workspace/db/client";
import { projectsTable } from "@workspace/db/schema/projects";
import { eq } from "drizzle-orm";
import { testWithAuthenticated } from "./fixtures/authenticated-test";

const test = testWithAuthenticated.extend<{
	projectsPage: Page;
	testProject: {
		name: string;
		projectId: string;
	};
}>({
	projectsPage: async ({ pageWithAdminUser: page }, use) => {
		await page.goto("/projects");
		await page.waitForURL("/projects");
		await expect(page.getByRole("main").getByText("読み込み中")).toHaveCount(0);

		await use(page);
	},
	// biome-ignore lint/correctness/noEmptyPattern: Playwrightのfixtureパターンで使用する標準的な記法
	async testProject({}, use) {
		const uniqueId = randomUUID().slice(0, 8);
		const projectId = randomUUID();
		const name = `一覧テストプロジェクト${uniqueId}`;

		await db.insert(projectsTable).values({
			name,
			projectId,
		});

		await use({ name, projectId });

		await db
			.delete(projectsTable)
			.where(eq(projectsTable.projectId, projectId));
	},
});

test("メニューからプロジェクト一覧ページに遷移できる", async ({
	pageWithAdminUser: page,
}) => {
	await test.step("メニューボタンをクリックしてメニューを開く", async () => {
		await page.getByRole("button", { name: /^メニューを開く$/ }).click();
	});

	await test.step("プロジェクト一覧リンクをクリック", async () => {
		await page.getByRole("link", { name: "プロジェクト一覧" }).click();
	});

	await test.step("プロジェクト一覧ページに遷移することを確認", async () => {
		await expect(page).toHaveURL("/projects");
		await expect(page.getByRole("heading", { name: "プロジェクト一覧" })).toBeVisible();
	});
});

test("プロジェクト一覧が表示される", async ({ projectsPage, testProject }) => {
	await test.step("プロジェクトが表示されていることを確認", async () => {
		await projectsPage.locator("table tbody tr").first().waitFor();
		const rows = projectsPage.locator("table tbody tr");
		const count = await rows.count();
		expect(count).toBeGreaterThan(0);
	});

	await test.step("テストプロジェクトが表示されていることを確認", async () => {
		// 検索でキャッシュをバイパスしてテストプロジェクトを探す（ユーザーテストと同パターン）
		await projectsPage
			.getByRole("main")
			.getByLabel("プロジェクト名")
			.fill(testProject.name);
		await projectsPage.getByRole("button", { name: "検索" }).click();
		await projectsPage.waitForURL(`**/projects?keyword=*`);
		await expect(
			projectsPage.getByRole("main").getByText("読み込み中"),
		).toHaveCount(0);

		await expect(
			projectsPage.getByRole("cell", { name: testProject.name }),
		).toBeVisible();
	});
});
