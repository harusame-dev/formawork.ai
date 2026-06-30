import { db } from "@workspace/db/client";
import { projectsTable } from "@workspace/db/schema/project";
import { translationMemoriesTable } from "@workspace/db/schema/translation-memory";
import { and, eq, sql } from "drizzle-orm";
import type { TmMatch } from "@/features/segment/assist-types";

/**
 * 類似過去訳として採用する最小コサイン類似度（0〜1）。
 * 類似度がこの値を下回る過去訳は「似ていない」とみなし採用しない。
 */
export const TM_MIN_SCORE = 0.7;

/**
 * 原文の埋め込みベクトルから、同一プロジェクト内の類似過去訳を
 * pgvector のコサイン距離（<=>）で取得する。
 * コサイン類似度が minScore 以上のものだけを採用し、類似度の高い順に
 * 最大 limit 件まで返す（似ていない過去訳は件数に満たなくても返さない）。
 */
export async function searchSimilarTm({
  limit = 10,
  minScore = TM_MIN_SCORE,
  projectId,
  queryEmbedding,
}: {
  limit?: number;
  minScore?: number;
  projectId: string;
  queryEmbedding: number[];
}): Promise<TmMatch[]> {
  const vectorLiteral = `[${queryEmbedding.join(",")}]`;
  // pgvector の演算子は extensions スキーマにあるが、ランタイム接続の
  // search_path には extensions が含まれず素の "<=>" を解決できない
  // （Supabase デプロイ環境では search_path がブランチスキーマのみになる）。
  // OPERATOR(extensions.<=>) で明示修飾する。HNSW インデックスも引き続き利用される。
  const distance = sql<number>`${translationMemoriesTable.sourceEmbedding} OPERATOR(extensions.<=>) ${vectorLiteral}::extensions.vector`;
  const score = sql<number>`1 - (${distance})`;

  const rows = await db
    .select({
      id: translationMemoriesTable.id,
      projectName: projectsTable.name,
      score,
      sourceText: translationMemoriesTable.sourceText,
      targetText: translationMemoriesTable.targetText,
    })
    .from(translationMemoriesTable)
    .innerJoin(
      projectsTable,
      eq(projectsTable.id, translationMemoriesTable.projectId),
    )
    .where(
      and(
        eq(translationMemoriesTable.projectId, projectId),
        sql`${score} >= ${minScore}`,
      ),
    )
    .orderBy(distance)
    .limit(limit);

  return rows.map((row) => ({
    id: row.id,
    projectName: row.projectName,
    score: Number(row.score),
    sourceText: row.sourceText,
    targetText: row.targetText,
  }));
}
