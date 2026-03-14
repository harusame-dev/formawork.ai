import { db } from "@workspace/db/client";
import { projectAssigneesTable } from "@workspace/db/schema/project-assignees";
import { projectsTable } from "@workspace/db/schema/projects";
import { staffsTable } from "@workspace/db/schema/staff";
import { eq } from "drizzle-orm";
import { v4 } from "uuid";
import { test as base, expect, vi } from "vitest";
import { registerProject } from "./register-project";

vi.mock("@repo/logger/nextjs/server", () => ({
	getLogger: vi.fn(() => ({
		error: vi.fn(),
		info: vi.fn(),
		warn: vi.fn(),
	})),
}));

const test = base.extend<{
	cleanup: { projectIds: string[] };
	staff: { staffId: string };
}>({
	// biome-ignore lint/correctness/noEmptyPattern: Vitestのfixtureパターンで使用する標準的な記法
	async cleanup({}, use) {
		const projectIds: string[] = [];
		await use({ projectIds });
		for (const projectId of projectIds) {
			await db
				.delete(projectsTable)
				.where(eq(projectsTable.projectId, projectId));
		}
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

test("プロジェクトを担当者なしで正常に登録できる", async ({ cleanup }) => {
	const input = {
		assigneeIds: [],
		description: "テスト詳細",
		dueDate: "2026-12-31",
		name: `テストプロジェクト${v4()}`,
	};

	const result = await registerProject(input);

	expect(result.success).toBe(true);
	if (result.success) {
		cleanup.projectIds.push(result.data.projectId);
		expect(result.data.projectId).toBeDefined();

		const [project] = await db
			.select()
			.from(projectsTable)
			.where(eq(projectsTable.projectId, result.data.projectId))
			.limit(1);

		expect(project?.name).toBe(input.name);
		expect(project?.description).toBe(input.description);
	}
});

test("プロジェクトを複数担当者で正常に登録できる", async ({
	cleanup,
	staff,
}) => {
	const input = {
		assigneeIds: [staff.staffId],
		description: "テスト詳細",
		dueDate: "2026-12-31",
		name: `テストプロジェクト${v4()}`,
	};

	const result = await registerProject(input);

	expect(result.success).toBe(true);
	if (result.success) {
		cleanup.projectIds.push(result.data.projectId);

		const assignees = await db
			.select()
			.from(projectAssigneesTable)
			.where(eq(projectAssigneesTable.projectId, result.data.projectId));

		expect(assignees).toHaveLength(1);
		expect(assignees[0]?.staffId).toBe(staff.staffId);
	}
});
