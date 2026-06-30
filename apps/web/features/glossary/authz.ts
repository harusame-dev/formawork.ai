import { canEditProject, getProjectAccess } from "@/features/project/authz";

/**
 * 用語集の編集権限を判定する。
 * - 共通用語集（projectId が null）：ログイン済みユーザーであれば編集可
 * - プロジェクト固有用語集：対象プロジェクトの編集権限（Owner / Editor）が必要
 */
export async function canEditGlossary(
  projectId: string | null,
  userId: string,
): Promise<boolean> {
  if (projectId === null) {
    return true;
  }

  const access = await getProjectAccess(projectId, userId);

  if (!access) {
    return false;
  }

  return canEditProject(access);
}
