import { db } from "@workspace/db/client";
import { projectsTable } from "@workspace/db/schema/projects";
import { staffsTable } from "@workspace/db/schema/staff";
import { eq } from "drizzle-orm";
import { v4 } from "uuid";
import { test as base, expect, vi } from "vitest";
import { getProjects } from "./get-projects";

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
	project: {
		projectId: string;
		name: string;
	};
	staff: {
		staffId: string;
	};
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
});

test("案件一覧を取得できる", async ({ project }) => {
	const result = await getProjects({ page: 1 });

	expect(result.projects.length).toBeGreaterThan(0);
	const found = result.projects.find((p) => p.projectId === project.projectId);
	expect(found).toBeDefined();
	expect(found?.name).toBe(project.name);
});

test("ページネーションが正しく動作する", async () => {
	const result = await getProjects({ page: 1 });

	expect(result.page).toBe(1);
	expect(result.totalPages).toBeGreaterThanOrEqual(1);
});
