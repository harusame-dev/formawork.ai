import { randomUUID } from "node:crypto";
import { expect, type Page } from "@playwright/test";
import { db } from "@workspace/db/client";
import { projectsTable } from "@workspace/db/schema/projects";
import { eq } from "drizzle-orm";
import { testWithAuthenticated } from "./fixtures/authenticated-test";

const test = testWithAuthenticated.extend<{
	editProjectPage: Page;
	testProject: {
		name: string;
		projectId: string;
	};
}>({
	async editProjectPage({ pageWithAdminUser: page, testProject }, use) {
		await page.goto(`/projects/${testProject.projectId}/edit`);
		await page.waitForURL(`/projects/${testProject.projectId}/edit`);

		await expect(page.getByLabel("プロジェクト名")).not.toBeDisabled();

		await use(page);
	},
	// biome-ignore lint/correctness/noEmptyPattern: Playwrightのfixtureパターンで使用する標準的な記法
	async testProject({}, use) {
		const uniqueId = randomUUID().slice(0, 8);
		const projectId = randomUUID();
		const name = `編集テストプロジェクト${uniqueId}`;

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

test("プロジェクトを編集できる", async ({ editProjectPage, testProject }) => {
	const newName = `${testProject.name}_更新`;

	await test.step("プロジェクト名を変更", async () => {
		await editProjectPage.getByLabel("プロジェクト名").fill(newName);
	});

	await test.step("編集ボタンをクリック", async () => {
		await editProjectPage.getByRole("button", { name: "編集する" }).click();
	});

	await test.step("プロジェクト詳細ページに遷移することを確認", async () => {
		await editProjectPage.waitForURL(`/projects/${testProject.projectId}`);
		await expect(
			editProjectPage.getByRole("heading", { name: newName }),
		).toBeVisible();
	});
});
