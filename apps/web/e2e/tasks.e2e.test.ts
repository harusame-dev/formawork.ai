import { randomUUID } from "node:crypto";
import { expect, type Page } from "@playwright/test";
import { db } from "@workspace/db/client";
import { projectsTable } from "@workspace/db/schema/projects";
import { tasksTable } from "@workspace/db/schema/tasks";
import { eq } from "drizzle-orm";
import { testWithAuthenticated } from "./fixtures/authenticated-test";

// シードデータで定義されている管理者スタッフID（佐藤次郎）
const ADMIN_STAFF_ID = "00000000-0000-0000-0000-000000000003";

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
		const name = `タスクE2Eテスト案件${uniqueId}`;

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

test("タスクを追加できる", async ({ projectDetailPage, testProject }) => {
	const taskName = `テストタスク${randomUUID().slice(0, 8)}`;

	await test.step("タスクを追加ボタンをクリック", async () => {
		await projectDetailPage
			.getByRole("button", { name: "タスクを追加" })
			.click();
	});

	await test.step("タスク名を入力", async () => {
		await projectDetailPage.getByLabel("タスク名").fill(taskName);

		// 担当者を選択
		const comboboxes = await projectDetailPage.getByRole("combobox").all();
		// ステータス、担当者の順でcomboboxが並ぶ
		if (comboboxes.length >= 2) {
			await comboboxes[1]?.click();
			await projectDetailPage.getByRole("option").first().click();
		}
	});

	await test.step("登録ボタンをクリック", async () => {
		await projectDetailPage
			.getByRole("dialog")
			.getByRole("button", { name: "登録する" })
			.click();
	});

	await test.step("タスクが表示されることを確認", async () => {
		await expect(
			projectDetailPage.getByRole("cell", { name: taskName }),
		).toBeVisible();
	});

	// クリーンアップ
	const tasks = await db
		.select({ taskId: tasksTable.taskId })
		.from(tasksTable)
		.where(eq(tasksTable.projectId, testProject.projectId));

	for (const task of tasks) {
		await db.delete(tasksTable).where(eq(tasksTable.taskId, task.taskId));
	}
});
