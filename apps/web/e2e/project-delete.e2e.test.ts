import { randomUUID } from "node:crypto";
import { expect, type Page } from "@playwright/test";
import { db } from "@workspace/db/client";
import { projectsTable } from "@workspace/db/schema/projects";
import { eq } from "drizzle-orm";
import { testWithAuthenticated } from "./fixtures/authenticated-test";

const test = testWithAuthenticated.extend<{
	projectDetailPage: Page;
	testProject: {
		name: string;
		projectId: string;
	};
}>({
	async projectDetailPage({ pageWithAdminUser: page, testProject }, use) {
		await page.goto(`/projects/${testProject.projectId}`);
		await page.waitForURL(`/projects/${testProject.projectId}`);

		await use(page);
	},
	// biome-ignore lint/correctness/noEmptyPattern: Playwrightのfixtureパターンで使用する標準的な記法
	async testProject({}, use) {
		const uniqueId = randomUUID().slice(0, 8);
		const projectId = randomUUID();
		const name = `削除テストプロジェクト${uniqueId}`;

		await db.insert(projectsTable).values({
			name,
			projectId,
		});

		await use({ name, projectId });

		// 削除失敗した場合のクリーンアップ
		const [existing] = await db
			.select()
			.from(projectsTable)
			.where(eq(projectsTable.projectId, projectId))
			.limit(1);

		if (existing) {
			await db
				.delete(projectsTable)
				.where(eq(projectsTable.projectId, projectId));
		}
	},
});

test("プロジェクトを削除できる", async ({ projectDetailPage }) => {
	await test.step("削除ボタンをクリック", async () => {
		await projectDetailPage.getByRole("button", { name: "削除" }).click();
	});

	await test.step("確認ダイアログが表示される", async () => {
		await expect(projectDetailPage.getByRole("dialog")).toBeVisible();
	});

	await test.step("ダイアログ内の削除ボタンをクリック", async () => {
		await projectDetailPage
			.getByRole("dialog")
			.getByRole("button", { name: "削除" })
			.click();
	});

	await test.step("プロジェクト一覧ページに遷移することを確認", async () => {
		await projectDetailPage.waitForURL("/projects");
	});
});
