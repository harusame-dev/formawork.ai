import { db } from "@workspace/db/client";
import { projectsTable } from "@workspace/db/schema/projects";
import { staffsTable } from "@workspace/db/schema/staff";
import { tasksTable } from "@workspace/db/schema/tasks";
import { eq } from "drizzle-orm";
import { v4 } from "uuid";
import { test as base, expect, vi } from "vitest";
import { deleteTask } from "./delete-task";

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
			name: `タスク削除テスト案件${v4()}`,
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
			name: `削除テストタスク${v4()}`,
			projectId: project.projectId,
			status: "todo",
			taskId,
		});
		await use({ taskId });
		await db.delete(tasksTable).where(eq(tasksTable.taskId, taskId));
	},
});

test("存在しないタスクを削除しようとした場合にエラーが返される", async ({
	project,
}) => {
	const result = await deleteTask({
		deletedBy: null,
		projectId: project.projectId,
		taskId: "99999999-9999-9999-9999-999999999999",
	});

	expect(result.success).toBe(false);
	if (!result.success) {
		expect(result.error).toBe("指定されたタスクが見つかりません");
	}
});

test("存在するタスクを削除できる", async ({ project, task }) => {
	const result = await deleteTask({
		deletedBy: null,
		projectId: project.projectId,
		taskId: task.taskId,
	});

	expect(result.success).toBe(true);

	const [deleted] = await db
		.select()
		.from(tasksTable)
		.where(eq(tasksTable.taskId, task.taskId))
		.limit(1);

	expect(deleted).toBeUndefined();
});
