import { db } from "@workspace/db/client";
import type { SelectProject } from "@workspace/db/schema/project";
import {
  ProjectMemberRole,
  ProjectVisibility,
  projectMembersTable,
  projectsTable,
} from "@workspace/db/schema/project";
import { and, eq } from "drizzle-orm";

interface ProjectAccess {
  /** メンバーの場合のロール。Public プロジェクトを非メンバーが閲覧する場合は null */
  role: ProjectMemberRole | null;
  project: SelectProject;
  isMember: boolean;
}

/**
 * ユーザーが対象プロジェクトにアクセスできるか判定する。
 * - Public: ログインユーザー全員が閲覧可
 * - Private: project_members に登録されたユーザーのみ
 *
 * アクセス不可（存在しない / Private で非メンバー）の場合は null を返す。
 */
export async function getProjectAccess(
  projectId: string,
  userId: string,
): Promise<ProjectAccess | null> {
  const project = await db.query.projectsTable.findFirst({
    where: eq(projectsTable.id, projectId),
  });

  if (!project) {
    return null;
  }

  const membership = await db.query.projectMembersTable.findFirst({
    where: and(
      eq(projectMembersTable.projectId, projectId),
      eq(projectMembersTable.userId, userId),
    ),
  });

  if (membership) {
    return {
      isMember: true,
      project,
      role: membership.role as ProjectMemberRole,
    };
  }

  if (project.visibility === ProjectVisibility.Public) {
    return { isMember: false, project, role: null };
  }

  return null;
}

/** 編集権限（Owner / Editor）を持つか */
export function canEditProject(access: ProjectAccess): boolean {
  return (
    access.role === ProjectMemberRole.Owner ||
    access.role === ProjectMemberRole.Editor
  );
}

/** 管理権限（Owner のみ：メンバー管理・削除・可視性変更） */
export function canManageProject(access: ProjectAccess): boolean {
  return access.role === ProjectMemberRole.Owner;
}
