import { fail, type Result, succeed } from "@harusame0616/result";
import { db } from "@workspace/db/client";
import { projectsTable } from "@workspace/db/schema/projects";
import { eq } from "drizzle-orm";
import { recordDeletion } from "@/features/deletion-log/record-deletion";

const PROJECT_NOT_FOUND_ERROR_MESSAGE =
	"指定された案件が見つかりません" as const;

type DeleteProjectErrorMessage = typeof PROJECT_NOT_FOUND_ERROR_MESSAGE;

type DeleteProjectInput = {
	deletedBy: string | null;
	projectId: string;
};

export async function deleteProject({
	deletedBy,
	projectId,
}: DeleteProjectInput): Promise<Result<undefined, DeleteProjectErrorMessage>> {
	const [project] = await db
		.select()
		.from(projectsTable)
		.where(eq(projectsTable.projectId, projectId))
		.limit(1);

	if (!project) {
		return fail(PROJECT_NOT_FOUND_ERROR_MESSAGE);
	}

	await recordDeletion({
		deletedBy,
		deletedData: project as Record<string, unknown>,
		recordId: projectId,
		tableName: "projects",
	});

	await db.delete(projectsTable).where(eq(projectsTable.projectId, projectId));

	return succeed();
}
