import { db } from "@workspace/db/client";
import type { ProjectVisibility } from "@workspace/db/schema/project";
import {
  ProjectVisibility as Visibility,
  projectMembersTable,
  projectsTable,
} from "@workspace/db/schema/project";
import { and, desc, eq, isNotNull, or } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { ProjectTag } from "@/features/project/tag";

export interface ProjectListItem {
  description: string;
  id: string;
  name: string;
  visibility: ProjectVisibility;
}

/**
 * ユーザーが閲覧可能なプロジェクト一覧を取得する。
 * Public プロジェクト、または自身がメンバーの Private プロジェクトを返す。
 */
export async function getProjects(userId: string): Promise<ProjectListItem[]> {
  "use cache";
  cacheLife("permanent");
  cacheTag(ProjectTag.List);

  // project_members は (project_id, user_id) で一意のため、
  // 自分のメンバーシップに絞った leftJoin は重複行を生まない（DISTINCT 不要）。
  const rows = await db
    .select({
      description: projectsTable.description,
      id: projectsTable.id,
      name: projectsTable.name,
      visibility: projectsTable.visibility,
    })
    .from(projectsTable)
    .leftJoin(
      projectMembersTable,
      and(
        eq(projectMembersTable.projectId, projectsTable.id),
        eq(projectMembersTable.userId, userId),
      ),
    )
    .where(
      or(
        eq(projectsTable.visibility, Visibility.Public),
        isNotNull(projectMembersTable.userId),
      ),
    )
    .orderBy(desc(projectsTable.createdAt));

  return rows.map((row) => ({
    description: row.description,
    id: row.id,
    name: row.name,
    visibility: row.visibility as ProjectVisibility,
  }));
}
