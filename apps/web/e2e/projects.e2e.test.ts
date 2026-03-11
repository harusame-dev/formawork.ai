import { randomUUID } from "node:crypto";
import { expect, type Page } from "@playwright/test";
import { db } from "@workspace/db/client";
import { projectsTable } from "@workspace/db/schema/projects";
import { eq } from "drizzle-orm";
import { testWithAuthenticated } from "./fixtures/authenticated-test";

// シードデータで定義されている管理者スタッフID（佐藤次郎）
const ADMIN_STAFF_ID = "00000000-0000-0000-0000-000000000003";

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
		await expect(page.getByRole("main").getByText("読み込み中")).toBeHidden();

		await use(page);
	},
	// biome-ignore lint/correctness/noEmptyPattern: Playwrightのfixtureパターンで使用する標準的な記法
	async testProject({}, use) {
		const uniqueId = randomUUID().slice(0, 8);
		const projectId = randomUUID();
		const name = `一覧テスト案件${uniqueId}`;

		await db.insert(projectsTable).values({
			assigneeId: ADMIN_STAFF_ID,
			name,
			projectId,
		});

		await use({ name, projectId });

		await db
			.delete(projectsTable)
			.where(eq(projectsTable.projectId, projectId));
	},
});

test("メニューから案件一覧ページに遷移できる", async ({
	pageWithAdminUser: page,
}) => {
	await test.step("メニューボタンをクリックしてメニューを開く", async () => {
		await page.getByRole("button", { name: /^メニューを開く$/ }).click();
	});

	await test.step("案件一覧リンクをクリック", async () => {
		await page.getByRole("link", { name: "案件一覧" }).click();
	});

	await test.step("案件一覧ページに遷移することを確認", async () => {
		await expect(page).toHaveURL("/projects");
		await expect(page.getByRole("heading", { name: "案件一覧" })).toBeVisible();
	});
});

test("案件一覧が表示される", async ({ projectsPage, testProject }) => {
	await test.step("案件が表示されていることを確認", async () => {
		await projectsPage.locator("table tbody tr").first().waitFor();
		const rows = projectsPage.locator("table tbody tr");
		const count = await rows.count();
		expect(count).toBeGreaterThan(0);
	});

	await test.step("テスト案件が表示されていることを確認", async () => {
		// 検索でキャッシュをバイパスしてテスト案件を探す（ユーザーテストと同パターン）
		await projectsPage
			.getByRole("main")
			.getByLabel("案件名")
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
