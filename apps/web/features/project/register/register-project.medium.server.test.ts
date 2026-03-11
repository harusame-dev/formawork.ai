import { db } from "@workspace/db/client";
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
		// スタッフ削除前に参照している案件を削除（FK制約違反を防ぐ）
		await db.delete(projectsTable).where(eq(projectsTable.assigneeId, staffId));
		await db.delete(staffsTable).where(eq(staffsTable.staffId, staffId));
	},
});

test("案件を正常に登録できる", async ({ cleanup, staff }) => {
	const input = {
		assigneeId: staff.staffId,
		description: "テスト詳細",
		dueDate: "2026-12-31",
		name: `テスト案件${v4()}`,
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
