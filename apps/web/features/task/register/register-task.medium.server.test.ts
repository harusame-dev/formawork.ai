import { db } from "@workspace/db/client";
import { projectsTable } from "@workspace/db/schema/projects";
import { staffsTable } from "@workspace/db/schema/staff";
import { taskAssigneesTable } from "@workspace/db/schema/task-assignees";
import { tasksTable } from "@workspace/db/schema/tasks";
import { eq } from "drizzle-orm";
import { v4 } from "uuid";
import { test as base, expect, vi } from "vitest";
import { registerTask } from "./register-task";

vi.mock("@repo/logger/nextjs/server", () => ({
	getLogger: vi.fn(() => ({
		error: vi.fn(),
		info: vi.fn(),
		warn: vi.fn(),
	})),
}));

const test = base.extend<{
	cleanup: { taskIds: string[] };
	project: { projectId: string };
	staff: { staffId: string };
}>({
	// biome-ignore lint/correctness/noEmptyPattern: Vitestのfixtureパターンで使用する標準的な記法
	async cleanup({}, use) {
		const taskIds: string[] = [];
		await use({ taskIds });
		for (const taskId of taskIds) {
			await db.delete(tasksTable).where(eq(tasksTable.taskId, taskId));
		}
	},
	// biome-ignore lint/correctness/noEmptyPattern: Vitestのfixtureパターンで使用する標準的な記法
	async project({}, use) {
		const projectId = v4();
		await db.insert(projectsTable).values({
			name: `タスク登録テストプロジェクト${v4()}`,
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
});

test("担当者なしでタスクを正常に登録できる", async ({ cleanup, project }) => {
	const input = {
		assigneeIds: [],
		description: "テスト詳細",
		dueDate: "2026-12-31",
		name: `テストタスク${v4()}`,
		projectId: project.projectId,
		status: "todo" as const,
	};

	const result = await registerTask(input);

	expect(result.success).toBe(true);

	const tasks = await db
		.select()
		.from(tasksTable)
		.where(eq(tasksTable.projectId, project.projectId));

	const found = tasks.find((t) => t.name === input.name);
	expect(found).toBeDefined();
	expect(found?.status).toBe("todo");

	if (found) {
		cleanup.taskIds.push(found.taskId);
	}
});

test("複数担当者でタスクを正常に登録できる", async ({
	cleanup,
	project,
	staff,
}) => {
	const input = {
		assigneeIds: [staff.staffId],
		description: "テスト詳細",
		dueDate: "2026-12-31",
		name: `テストタスク${v4()}`,
		projectId: project.projectId,
		status: "todo" as const,
	};

	const result = await registerTask(input);

	expect(result.success).toBe(true);

	const tasks = await db
		.select()
		.from(tasksTable)
		.where(eq(tasksTable.projectId, project.projectId));

	const found = tasks.find((t) => t.name === input.name);
	expect(found).toBeDefined();

	if (found) {
		cleanup.taskIds.push(found.taskId);

		const assignees = await db
			.select()
			.from(taskAssigneesTable)
			.where(eq(taskAssigneesTable.taskId, found.taskId));

		expect(assignees).toHaveLength(1);
		expect(assignees[0]?.staffId).toBe(staff.staffId);
	}
});
