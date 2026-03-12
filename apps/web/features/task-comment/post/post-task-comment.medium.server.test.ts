import { db } from "@workspace/db/client";
import { projectsTable } from "@workspace/db/schema/projects";
import { staffsTable } from "@workspace/db/schema/staff";
import { taskCommentsTable } from "@workspace/db/schema/task-comments";
import { tasksTable } from "@workspace/db/schema/tasks";
import { eq } from "drizzle-orm";
import { v4 } from "uuid";
import { test as base, expect, vi } from "vitest";
import { postTaskComment } from "./post-task-comment";

vi.mock("@repo/logger/nextjs/server", () => ({
	getLogger: vi.fn(() => ({
		error: vi.fn(),
		info: vi.fn(),
		warn: vi.fn(),
	})),
}));

const test = base.extend<{
	project: { projectId: string };
	staff: { staffId: string };
	task: { taskId: string };
}>({
	// biome-ignore lint/correctness/noEmptyPattern: Vitestのfixtureパターンで使用する標準的な記法
	async project({}, use) {
		const projectId = v4();
		await db.insert(projectsTable).values({
			name: `コメント投稿テスト案件${v4()}`,
			projectId,
		});
		await use({ projectId });
		await db
			.delete(projectsTable)
			.where(eq(projectsTable.projectId, projectId));
	},
	// biome-ignore lint/correctness/noEmptyPattern: Vitestのfixtureパターンで使用する標準的な記法
	async staff({}, use) {
		const staffId = v4();
		await db.insert(staffsTable).values({
			firstName: "テスト",
			lastName: "スタッフ",
			staffId,
		});
		await use({ staffId });
		await db.delete(staffsTable).where(eq(staffsTable.staffId, staffId));
	},
	async task({ project, staff }, use) {
		const taskId = v4();
		await db.insert(tasksTable).values({
			assigneeId: staff.staffId,
			name: `コメントテストタスク${v4()}`,
			projectId: project.projectId,
			status: "todo",
			taskId,
		});
		await use({ taskId });
		await db.delete(tasksTable).where(eq(tasksTable.taskId, taskId));
	},
});

test("コメントを投稿できる", async ({ project, staff, task }) => {
	const result = await postTaskComment(
		{ content: "テストコメント", taskId: task.taskId },
		{ role: "user", userId: staff.staffId },
	);

	expect(result.success).toBe(true);

	const comments = await db
		.select()
		.from(taskCommentsTable)
		.where(eq(taskCommentsTable.taskId, task.taskId));

	expect(comments).toHaveLength(1);
	expect(comments[0]?.content).toBe("テストコメント");

	// クリーンアップ
	await db
		.delete(taskCommentsTable)
		.where(eq(taskCommentsTable.taskId, task.taskId));
});

test("存在しないタスクIDを指定するとエラーが返される", async ({ staff }) => {
	await expect(
		postTaskComment(
			{
				content: "テストコメント",
				taskId: "99999999-9999-9999-9999-999999999999",
			},
			{ role: "user", userId: staff.staffId },
		),
	).rejects.toThrow();
});
