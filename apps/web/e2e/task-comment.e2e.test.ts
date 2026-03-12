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
	taskDetailPage: Page;
	testProject: { projectId: string };
	testTask: { taskId: string };
}>({
	async taskDetailPage(
		{ pageWithAdminUser: page, testProject, testTask },
		use,
	) {
		await page.goto(
			`/projects/${testProject.projectId}/tasks/${testTask.taskId}`,
		);
		await page.waitForURL(
			`/projects/${testProject.projectId}/tasks/${testTask.taskId}`,
		);
		await use(page);
	},
	// biome-ignore lint/correctness/noEmptyPattern: Playwrightのfixtureパターンで使用する標準的な記法
	async testProject({}, use) {
		const projectId = randomUUID();
		await db.insert(projectsTable).values({
			assigneeId: ADMIN_STAFF_ID,
			name: `コメントE2Eテスト案件${randomUUID().slice(0, 8)}`,
			projectId,
		});
		await use({ projectId });
		await db
			.delete(projectsTable)
			.where(eq(projectsTable.projectId, projectId));
	},
	async testTask({ testProject }, use) {
		const taskId = randomUUID();
		await db.insert(tasksTable).values({
			assigneeId: ADMIN_STAFF_ID,
			name: `コメントE2Eテストタスク${randomUUID().slice(0, 8)}`,
			projectId: testProject.projectId,
			status: "todo",
			taskId,
		});
		await use({ taskId });
		await db.delete(tasksTable).where(eq(tasksTable.taskId, taskId));
	},
});

test("タスク詳細ページでコメントを投稿できる", async ({ taskDetailPage }) => {
	const commentText = `テストコメント${randomUUID().slice(0, 8)}`;

	await test.step("コメントを入力して投稿", async () => {
		await taskDetailPage
			.getByPlaceholder("コメントを入力してください")
			.fill(commentText);
		await taskDetailPage
			.getByRole("button", { name: "コメントを投稿" })
			.click();
	});

	await test.step("投稿したコメントが表示されることを確認", async () => {
		await expect(taskDetailPage.getByText(commentText)).toBeVisible();
	});
});

test("自分が投稿したコメントを編集できる", async ({ taskDetailPage }) => {
	const originalText = `編集前コメント${randomUUID().slice(0, 8)}`;
	const editedText = `編集後コメント${randomUUID().slice(0, 8)}`;

	await test.step("コメントをUIから投稿", async () => {
		await taskDetailPage
			.getByPlaceholder("コメントを入力してください")
			.fill(originalText);
		await taskDetailPage
			.getByRole("button", { name: "コメントを投稿" })
			.click();
		await expect(taskDetailPage.getByText(originalText)).toBeVisible();
	});

	await test.step("編集ボタンをクリック", async () => {
		await taskDetailPage
			.getByRole("list")
			.getByRole("button", { name: "編集" })
			.first()
			.click();
	});

	await test.step("コメントを編集して保存", async () => {
		const dialog = taskDetailPage.getByRole("dialog");
		await dialog.getByRole("textbox").clear();
		await dialog.getByRole("textbox").fill(editedText);
		await dialog.getByRole("button", { name: "保存する" }).click();
	});

	await test.step("編集後のコメントが表示されることを確認", async () => {
		await expect(taskDetailPage.getByText(editedText)).toBeVisible();
	});
});

test("自分が投稿したコメントを削除できる", async ({ taskDetailPage }) => {
	const commentText = `削除するコメント${randomUUID().slice(0, 8)}`;

	await test.step("コメントをUIから投稿", async () => {
		await taskDetailPage
			.getByPlaceholder("コメントを入力してください")
			.fill(commentText);
		await taskDetailPage
			.getByRole("button", { name: "コメントを投稿" })
			.click();
		await expect(taskDetailPage.getByText(commentText)).toBeVisible();
	});

	await test.step("削除ボタンをクリック", async () => {
		await taskDetailPage
			.getByRole("list")
			.getByRole("button", { name: "削除" })
			.first()
			.click();
	});

	await test.step("確認ダイアログが表示される", async () => {
		await expect(taskDetailPage.getByRole("dialog")).toBeVisible();
	});

	await test.step("ダイアログ内の削除ボタンをクリック", async () => {
		await taskDetailPage
			.getByRole("dialog")
			.getByRole("button", { name: "削除" })
			.click();
	});

	await test.step("コメントが削除されることを確認", async () => {
		await expect(taskDetailPage.getByText(commentText)).not.toBeVisible();
	});
});

test("管理者が他人のコメントを削除できる", async ({
	taskDetailPage,
	pageWithGenericUser,
	testProject,
	testTask,
}) => {
	const otherUserCommentText = `他ユーザーコメント${randomUUID().slice(0, 8)}`;

	await test.step("一般ユーザーがコメントを投稿", async () => {
		await pageWithGenericUser.goto(
			`/projects/${testProject.projectId}/tasks/${testTask.taskId}`,
		);
		await pageWithGenericUser
			.getByPlaceholder("コメントを入力してください")
			.fill(otherUserCommentText);
		await pageWithGenericUser
			.getByRole("button", { name: "コメントを投稿" })
			.click();
		await expect(
			pageWithGenericUser.getByText(otherUserCommentText),
		).toBeVisible();
	});

	await test.step("管理者ページをリロード", async () => {
		await taskDetailPage.reload();
		await expect(taskDetailPage.getByText(otherUserCommentText)).toBeVisible();
	});

	await test.step("管理者が他ユーザーのコメントの削除ボタンをクリック", async () => {
		await taskDetailPage
			.getByRole("list")
			.getByRole("button", { name: "削除" })
			.first()
			.click();
	});

	await test.step("確認ダイアログが表示される", async () => {
		await expect(taskDetailPage.getByRole("dialog")).toBeVisible();
	});

	await test.step("ダイアログ内の削除ボタンをクリック", async () => {
		await taskDetailPage
			.getByRole("dialog")
			.getByRole("button", { name: "削除" })
			.click();
	});

	await test.step("コメントが削除されることを確認", async () => {
		await expect(
			taskDetailPage.getByText(otherUserCommentText),
		).not.toBeVisible();
	});
});
