import { fail, type Result, succeed } from "@harusame0616/result";
import { db } from "@workspace/db/client";
import { SegmentStatus, segmentsTable } from "@workspace/db/schema/segment";
import { and, eq, gt, sql } from "drizzle-orm";
import { splitSentences } from "@/features/work/import/split-into-segments";
import { updateWorkStatus } from "@/features/work/update-work-status";
import type { SegmentDto } from "./get-work-segments";
import { readSegmentDtos } from "./merge-segments";
import { loadSegmentForEdit, type SegmentAuthzError } from "./segment-authz";

const CANNOT_SPLIT_ERROR = "この位置では分割できません" as const;

type ErrorMessage = SegmentAuthzError | typeof CANNOT_SPLIT_ERROR;

export async function splitSegment({
  segmentId,
  splitIndex,
  userId,
}: {
  segmentId: string;
  splitIndex: number;
  userId: string;
}): Promise<Result<SegmentDto[], ErrorMessage>> {
  const loaded = await loadSegmentForEdit(segmentId, userId);

  if (!loaded.success) {
    return loaded;
  }

  const { segment } = loaded.data;
  const parts = splitSentences(segment.sourceText);

  if (parts.length < 2 || splitIndex < 0 || splitIndex >= parts.length - 1) {
    return fail<ErrorMessage>(CANNOT_SPLIT_ERROR);
  }

  const firstSource = parts.slice(0, splitIndex + 1).join("");
  const secondSource = parts.slice(splitIndex + 1).join("");
  const { workId } = segment;

  return db.transaction(async (tx) => {
    // 分割元は原文前半に更新（訳文・ステータスは維持）
    await tx
      .update(segmentsTable)
      .set({ sourceText: firstSource })
      .where(eq(segmentsTable.id, segmentId));

    // 後続セグメントの seq を 1 つずつ繰り下げて挿入位置を空ける
    await tx
      .update(segmentsTable)
      .set({ seq: sql`${segmentsTable.seq} + 1` })
      .where(
        and(
          eq(segmentsTable.workId, workId),
          gt(segmentsTable.seq, segment.seq),
        ),
      );

    // 原文後半を未訳の新規セグメントとして挿入
    await tx.insert(segmentsTable).values({
      seq: segment.seq + 1,
      sourceText: secondSource,
      status: SegmentStatus.Untranslated,
      targetText: null,
      workId,
    });

    await updateWorkStatus(tx, workId);

    return succeed(await readSegmentDtos(tx, workId));
  });
}
