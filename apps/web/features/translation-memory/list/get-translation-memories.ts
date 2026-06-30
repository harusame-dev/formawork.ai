import { db } from "@workspace/db/client";
import {
  ProjectVisibility,
  projectMembersTable,
  projectsTable,
} from "@workspace/db/schema/project";
import { translationMemoriesTable } from "@workspace/db/schema/translation-memory";
import { and, desc, eq, isNotNull, or } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { TranslationMemoryTag } from "@/features/translation-memory/tag";

export interface TranslationMemoryItem {
  createdAt: Date;
  id: string;
  projectName: string;
  sourceText: string;
  targetText: string;
}

/**
 * ログインユーザーがアクセス可能なプロジェクトの翻訳メモリを横断取得する。
 * Public プロジェクト、または自身がメンバーの Private プロジェクトの TM を返す。
 */
export async function getTranslationMemories(
  userId: string,
): Promise<TranslationMemoryItem[]> {
  "use cache";
  cacheLife("permanent");
  cacheTag(TranslationMemoryTag.All);

  const rows = await db
    .selectDistinct({
      createdAt: translationMemoriesTable.createdAt,
      id: translationMemoriesTable.id,
      projectName: projectsTable.name,
      sourceText: translationMemoriesTable.sourceText,
      targetText: translationMemoriesTable.targetText,
    })
    .from(translationMemoriesTable)
    .innerJoin(
      projectsTable,
      eq(projectsTable.id, translationMemoriesTable.projectId),
    )
    .leftJoin(
      projectMembersTable,
      and(
        eq(projectMembersTable.projectId, projectsTable.id),
        eq(projectMembersTable.userId, userId),
      ),
    )
    .where(
      or(
        eq(projectsTable.visibility, ProjectVisibility.Public),
        isNotNull(projectMembersTable.userId),
      ),
    )
    .orderBy(desc(translationMemoriesTable.createdAt))
    .limit(200);

  return rows;
}
