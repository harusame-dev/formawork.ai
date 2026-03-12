import { db } from "@workspace/db/client";
import { projectsTable } from "@workspace/db/schema/projects";
import { staffsTable } from "@workspace/db/schema/staff";
import { taskCommentsTable } from "@workspace/db/schema/task-comments";
import { tasksTable } from "@workspace/db/schema/tasks";
import { eq } from "drizzle-orm";
import { v4 } from "uuid";
import { test as base, expect, vi } from "vitest";
import { deleteTaskComment } from "./delete-task-comment";

vi.mock("@repo/logger/nextjs/server", () => ({
	getLogger: vi.fn(() => ({
		error: vi.fn(),
		info: vi.fn(),
		warn: vi.fn(),
	})),
}));

const test = base.extend<{
	otherStaff: { staffId: string };
	project: { projectId: string };
	staff: { staffId: string };
	task: { taskId: string };
}>({
	// biome-ignore lint/correctness/noEmptyPattern: Vitestのfixtureパターンで使用する標準的な記法
	async otherStaff({}, use) {
		const staffId = v4();
		await db.insert(staffsTable).values({
			firstName: "他",
			lastName: "スタッフ",
			staffId,
		});
		await use({ staffId });
		await db.delete(staffsTable).where(eq(staffsTable.staffId, staffId));
	},
	// biome-ignore lint/correctness/noEmptyPattern: Vitestのfixtureパターンで使用する標準的な記法
	async project({}, use) {
		const projectId = v4();
		await db.insert(projectsTable).values({
			name: `コメント削除テスト案件${v4()}`,
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

test("投稿者本人がコメントを削除できる", async ({ project, staff, task }) => {
	const commentId = v4();
	await db.insert(taskCommentsTable).values({
		authorId: staff.staffId,
		commentId,
		content: "テストコメント",
		taskId: task.taskId,
	});

	const result = await deleteTaskComment(
		{ commentId, taskId: task.taskId },
		{ role: "user", userId: staff.staffId },
	);

	expect(result.success).toBe(true);

	const [deleted] = await db
		.select()
		.from(taskCommentsTable)
		.where(eq(taskCommentsTable.commentId, commentId))
		.limit(1);

	expect(deleted).toBeUndefined();
});

test("管理者が他人のコメントを削除できる", async ({
	otherStaff,
	project,
	staff,
	task,
}) => {
	const commentId = v4();
	await db.insert(taskCommentsTable).values({
		authorId: staff.staffId,
		commentId,
		content: "テストコメント",
		taskId: task.taskId,
	});

	const result = await deleteTaskComment(
		{ commentId, taskId: task.taskId },
		{ role: "admin", userId: otherStaff.staffId },
	);

	expect(result.success).toBe(true);

	const [deleted] = await db
		.select()
		.from(taskCommentsTable)
		.where(eq(taskCommentsTable.commentId, commentId))
		.limit(1);

	expect(deleted).toBeUndefined();
});

test("権限のないユーザーが削除しようとするとエラーが返される", async ({
	otherStaff,
	project,
	staff,
	task,
}) => {
	const commentId = v4();
	await db.insert(taskCommentsTable).values({
		authorId: staff.staffId,
		commentId,
		content: "テストコメント",
		taskId: task.taskId,
	});

	const result = await deleteTaskComment(
		{ commentId, taskId: task.taskId },
		{ role: "user", userId: otherStaff.staffId },
	);

	expect(result.success).toBe(false);
	if (!result.success) {
		expect(result.error).toBe("この操作を実行する権限がありません");
	}

	// クリーンアップ
	await db
		.delete(taskCommentsTable)
		.where(eq(taskCommentsTable.commentId, commentId));
});
