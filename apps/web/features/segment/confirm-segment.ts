import { fail, type Result, succeed } from "@harusame0616/result";
import { db } from "@workspace/db/client";
import { SegmentStatus, segmentsTable } from "@workspace/db/schema/segment";
import { eq } from "drizzle-orm";
import { accumulateTranslationMemory } from "@/features/translation-memory/accumulate-translation-memory";
import { updateWorkStatus } from "@/features/work/update-work-status";
import { loadSegmentForEdit, type SegmentAuthzError } from "./segment-authz";

const EMPTY_TARGET_ERROR = "訳文が空です" as const;

export async function confirmSegment({
  segmentId,
  userId,
}: {
  segmentId: string;
  userId: string;
}): Promise<Result<undefined, SegmentAuthzError | typeof EMPTY_TARGET_ERROR>> {
  const loaded = await loadSegmentForEdit(segmentId, userId);

  if (!loaded.success) {
    return loaded;
  }

  const { projectId, segment } = loaded.data;

  if (!segment.targetText || segment.targetText.trim().length === 0) {
    return fail(EMPTY_TARGET_ERROR);
  }

  await db.transaction(async (tx) => {
    await tx
      .update(segmentsTable)
      .set({ status: SegmentStatus.Confirmed })
      .where(eq(segmentsTable.id, segmentId));
    await updateWorkStatus(tx, segment.workId);
  });

  // 確定した対訳を翻訳メモリへ蓄積（原文の埋め込みも保存）。
  // 埋め込み生成に失敗してもセグメント確定自体は成功とする。
  await accumulateTranslationMemory({
    projectId,
    sourceText: segment.sourceText,
    targetText: segment.targetText,
  });

  return succeed();
}
