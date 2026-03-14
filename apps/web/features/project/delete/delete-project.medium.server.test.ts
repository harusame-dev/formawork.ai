import { db } from "@workspace/db/client";
import { projectsTable } from "@workspace/db/schema/projects";
import { eq } from "drizzle-orm";
import { v4 } from "uuid";
import { test as base, expect, vi } from "vitest";
import { deleteProject } from "./delete-project";

vi.mock("@repo/logger/nextjs/server", () => ({
	getLogger: vi.fn(() => ({
		error: vi.fn(),
		info: vi.fn(),
		warn: vi.fn(),
	})),
}));

const test = base.extend<{
	project: { projectId: string };
}>({
	// biome-ignore lint/correctness/noEmptyPattern: Vitestのfixtureパターンで使用する標準的な記法
	async project({}, use) {
		const projectId = v4();
		await db.insert(projectsTable).values({
			name: `削除テストプロジェクト${v4()}`,
			projectId,
		});
		await use({ projectId });
		await db
			.delete(projectsTable)
			.where(eq(projectsTable.projectId, projectId));
	},
});

test("存在しないプロジェクトを削除しようとした場合にエラーが返される", async () => {
	const result = await deleteProject({
		deletedBy: null,
		projectId: "99999999-9999-9999-9999-999999999999",
	});

	expect(result.success).toBe(false);
	if (!result.success) {
		expect(result.error).toBe("指定されたプロジェクトが見つかりません");
	}
});

test("存在するプロジェクトを削除できる", async ({ project }) => {
	const result = await deleteProject({
		deletedBy: null,
		projectId: project.projectId,
	});

	expect(result.success).toBe(true);

	const [deleted] = await db
		.select()
		.from(projectsTable)
		.where(eq(projectsTable.projectId, project.projectId))
		.limit(1);

	expect(deleted).toBeUndefined();
});
