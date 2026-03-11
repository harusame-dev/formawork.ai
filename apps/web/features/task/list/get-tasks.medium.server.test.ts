import { db } from "@workspace/db/client";
import { projectsTable } from "@workspace/db/schema/projects";
import { staffsTable } from "@workspace/db/schema/staff";
import { tasksTable } from "@workspace/db/schema/tasks";
import { eq } from "drizzle-orm";
import { v4 } from "uuid";
import { test as base, expect, vi } from "vitest";
import { getTasks } from "./get-tasks";

vi.mock("next/cache", () => ({
	cacheLife: vi.fn(),
	cacheTag: vi.fn(),
}));

const test = base.extend<{
	project: { projectId: string };
	staff: { staffId: string };
	task: { taskId: string; name: string };
}>({
	// biome-ignore lint/correctness/noEmptyPattern: Vitestのfixtureパターンで使用する標準的な記法
	async project({}, use) {
		const projectId = v4();
		await db.insert(projectsTable).values({
			name: `タスクテスト案件${v4()}`,
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
		const name = `テストタスク${v4()}`;
		await db.insert(tasksTable).values({
			assigneeId: staff.staffId,
			name,
			projectId: project.projectId,
			status: "todo",
			taskId,
		});
		await use({ name, taskId });
		await db.delete(tasksTable).where(eq(tasksTable.taskId, taskId));
	},
});

test("プロジェクトのタスク一覧を取得できる", async ({ project, task }) => {
	const tasks = await getTasks(project.projectId);

	expect(tasks.length).toBeGreaterThan(0);
	const found = tasks.find((t) => t.taskId === task.taskId);
	expect(found).toBeDefined();
	expect(found?.name).toBe(task.name);
});

test("別のプロジェクトのタスクは含まれない", async ({ task }) => {
	const otherProjectId = v4();
	const tasks = await getTasks(otherProjectId);

	const found = tasks.find((t) => t.taskId === task.taskId);
	expect(found).toBeUndefined();
});
