import { fail, type Result, succeed } from "@harusame0616/result";
import { db } from "@workspace/db/client";
import { projectsTable } from "@workspace/db/schema/project";
import { eq } from "drizzle-orm";
import { canManageProject, getProjectAccess } from "@/features/project/authz";

const PROJECT_NOT_FOUND_ERROR = "プロジェクトが見つかりません" as const;
const FORBIDDEN_ERROR = "この操作を実行する権限がありません" as const;

type ErrorMessage = typeof PROJECT_NOT_FOUND_ERROR | typeof FORBIDDEN_ERROR;

export async function deleteProject({
  projectId,
  userId,
}: {
  projectId: string;
  userId: string;
}): Promise<Result<undefined, ErrorMessage>> {
  const access = await getProjectAccess(projectId, userId);

  if (!access) {
    return fail(PROJECT_NOT_FOUND_ERROR);
  }

  if (!canManageProject(access)) {
    return fail(FORBIDDEN_ERROR);
  }

  // works / segments / translation_memories / glossaries / project_members は
  // FK の ON DELETE CASCADE で連鎖削除される
  await db.delete(projectsTable).where(eq(projectsTable.id, projectId));

  return succeed();
}
