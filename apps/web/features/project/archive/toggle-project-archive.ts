import { fail, type Result, succeed } from "@harusame0616/result";
import { db } from "@workspace/db/client";
import { projectsTable } from "@workspace/db/schema/projects";
import { eq } from "drizzle-orm";

export async function toggleProjectArchive(
	projectId: string,
): Promise<Result<{ wasArchived: boolean }, string>> {
	const [project] = await db
		.select()
		.from(projectsTable)
		.where(eq(projectsTable.projectId, projectId))
		.limit(1);

	if (!project) {
		return fail("指定されたプロジェクトが見つかりません");
	}

	const wasArchived = project.archivedAt === null;
	const archivedAt = wasArchived ? new Date() : null;

	await db
		.update(projectsTable)
		.set({ archivedAt })
		.where(eq(projectsTable.projectId, projectId));

	return succeed({ wasArchived });
}
