import { fail, type Result, succeed } from "@harusame0616/result";
import { db } from "@workspace/db/client";
import { projectMembersTable } from "@workspace/db/schema/project";
import { and, eq } from "drizzle-orm";
import { canManageProject, getProjectAccess } from "@/features/project/authz";
import type { RemoveMemberParams } from "./schema";

const PROJECT_NOT_FOUND_ERROR = "プロジェクトが見つかりません" as const;
const FORBIDDEN_ERROR = "この操作を実行する権限がありません" as const;
const CANNOT_REMOVE_OWNER_ERROR = "オーナーは削除できません" as const;

type ErrorMessage =
  | typeof PROJECT_NOT_FOUND_ERROR
  | typeof FORBIDDEN_ERROR
  | typeof CANNOT_REMOVE_OWNER_ERROR;

export async function removeMember({
  operatorUserId,
  projectId,
  userId,
}: RemoveMemberParams & {
  operatorUserId: string;
}): Promise<Result<undefined, ErrorMessage>> {
  const access = await getProjectAccess(projectId, operatorUserId);

  if (!access) {
    return fail(PROJECT_NOT_FOUND_ERROR);
  }

  if (!canManageProject(access)) {
    return fail(FORBIDDEN_ERROR);
  }

  if (access.project.ownerUserId === userId) {
    return fail(CANNOT_REMOVE_OWNER_ERROR);
  }

  await db
    .delete(projectMembersTable)
    .where(
      and(
        eq(projectMembersTable.projectId, projectId),
        eq(projectMembersTable.userId, userId),
      ),
    );

  return succeed();
}
