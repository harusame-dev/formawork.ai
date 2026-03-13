import { db } from "@workspace/db/client";
import { projectsTable } from "@workspace/db/schema/projects";
import { staffsTable } from "@workspace/db/schema/staff";
import { tasksTable } from "@workspace/db/schema/tasks";
import { eq } from "drizzle-orm";
import { v4 } from "uuid";
import { test as base, expect, vi } from "vitest";
import { getAllTasks } from "./get-all-tasks";

vi.mock("next/cache", () => ({
	cacheLife: vi.fn(),
	cacheTag: vi.fn(),
}));

vi.mock("@repo/logger/nextjs/server", () => ({
	getLogger: vi.fn(() => ({
		error: vi.fn(),
		info: vi.fn(),
		warn: vi.fn(),
	})),
}));

const test = base.extend<{
	project: { projectId: string; name: string };
	staff: { staffId: string };
	task: { taskId: string; name: string };
}>({
	async project({ staff }, use) {
		const projectId = v4();
		const name = `テスト案件${v4()}`;
		await db.insert(projectsTable).values({
			assigneeId: staff.staffId,
			name,
			projectId,
		});
		await use({ name, projectId });
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

test("条件なしで全タスクを取得できる", async ({ task }) => {
	const result = await getAllTasks();

	const found = result.find((t) => t.taskId === task.taskId);
	expect(found).toBeDefined();
	expect(found?.name).toBe(task.name);
});

test("キーワードで絞り込みができる", async ({ task }) => {
	const uniquePart = task.name.slice(-36); // UUIDの部分

	const result = await getAllTasks({ keyword: uniquePart });

	const found = result.find((t) => t.taskId === task.taskId);
	expect(found).toBeDefined();
});

test("キーワード不一致時はヒットしない", async ({ task }) => {
	const result = await getAllTasks({ keyword: `存在しないキーワード_${v4()}` });

	const found = result.find((t) => t.taskId === task.taskId);
	expect(found).toBeUndefined();
});

test("ステータスで絞り込みができる", async ({ task }) => {
	const result = await getAllTasks({ statuses: ["todo"] });

	const found = result.find((t) => t.taskId === task.taskId);
	expect(found).toBeDefined();
	expect(found?.status).toBe("todo");
});

test("ステータス不一致時はヒットしない", async ({ task }) => {
	const result = await getAllTasks({ statuses: ["done"] });

	const found = result.find((t) => t.taskId === task.taskId);
	expect(found).toBeUndefined();
});

test("担当者で絞り込みができる", async ({ task, staff }) => {
	const result = await getAllTasks({ assigneeIds: [staff.staffId] });

	const found = result.find((t) => t.taskId === task.taskId);
	expect(found).toBeDefined();
});

test("担当者不一致時はヒットしない", async ({ task }) => {
	const result = await getAllTasks({ assigneeIds: [v4()] });

	const found = result.find((t) => t.taskId === task.taskId);
	expect(found).toBeUndefined();
});

test("プロジェクトで絞り込みができる", async ({ task, project }) => {
	const result = await getAllTasks({ projectIds: [project.projectId] });

	const found = result.find((t) => t.taskId === task.taskId);
	expect(found).toBeDefined();
});

test("期限の開始日フィルタが動作する", async ({ project, staff }) => {
	const taskId = v4();
	await db.insert(tasksTable).values({
		assigneeId: staff.staffId,
		dueDate: "2025-01-15",
		name: `期限テスト${v4()}`,
		projectId: project.projectId,
		status: "todo",
		taskId,
	});

	try {
		const result = await getAllTasks({ dueDateFrom: "2025-01-10" });
		const found = result.find((t) => t.taskId === taskId);
		expect(found).toBeDefined();

		const result2 = await getAllTasks({ dueDateFrom: "2025-01-20" });
		const found2 = result2.find((t) => t.taskId === taskId);
		expect(found2).toBeUndefined();
	} finally {
		await db.delete(tasksTable).where(eq(tasksTable.taskId, taskId));
	}
});

test("期限の終了日フィルタが動作する", async ({ project, staff }) => {
	const taskId = v4();
	await db.insert(tasksTable).values({
		assigneeId: staff.staffId,
		dueDate: "2025-06-15",
		name: `期限テスト${v4()}`,
		projectId: project.projectId,
		status: "todo",
		taskId,
	});

	try {
		const result = await getAllTasks({ dueDateTo: "2025-06-30" });
		const found = result.find((t) => t.taskId === taskId);
		expect(found).toBeDefined();

		const result2 = await getAllTasks({ dueDateTo: "2025-06-01" });
		const found2 = result2.find((t) => t.taskId === taskId);
		expect(found2).toBeUndefined();
	} finally {
		await db.delete(tasksTable).where(eq(tasksTable.taskId, taskId));
	}
});
