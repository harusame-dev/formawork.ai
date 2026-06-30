import { getLogger } from "@repo/logger/nextjs/server";
import { db } from "@workspace/db/client";
import { translationMemoriesTable } from "@workspace/db/schema/translation-memory";
import { and, eq } from "drizzle-orm";
import { embedText } from "@/libs/ai/embed.server";

/**
 * 確定した対訳を翻訳メモリへ蓄積する。原文を埋め込みベクトル化して保存する。
 * 同一プロジェクト・同一原文が既にある場合は訳文と埋め込みを更新する。
 *
 * 埋め込み生成や保存に失敗してもセグメント確定処理を妨げないよう、
 * 例外は内部で握りつぶしてログのみ残す。
 */
export async function accumulateTranslationMemory({
  projectId,
  sourceText,
  targetText,
}: {
  projectId: string;
  sourceText: string;
  targetText: string;
}): Promise<void> {
  try {
    const sourceEmbedding = await embedText(sourceText);

    const existing = await db.query.translationMemoriesTable.findFirst({
      where: and(
        eq(translationMemoriesTable.projectId, projectId),
        eq(translationMemoriesTable.sourceText, sourceText),
      ),
    });

    await (existing
      ? db
          .update(translationMemoriesTable)
          .set({ sourceEmbedding, targetText })
          .where(eq(translationMemoriesTable.id, existing.id))
      : db.insert(translationMemoriesTable).values({
          projectId,
          sourceEmbedding,
          sourceText,
          targetText,
        }));
  } catch (error) {
    const logger = await getLogger("accumulateTranslationMemory");
    logger.error("翻訳メモリの蓄積に失敗しました", { err: error });
  }
}
