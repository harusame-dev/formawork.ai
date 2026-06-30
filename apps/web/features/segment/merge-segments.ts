import { fail, type Result, succeed } from "@harusame0616/result";
import { db } from "@workspace/db/client";
import { SegmentStatus, segmentsTable } from "@workspace/db/schema/segment";
import { asc, eq, inArray } from "drizzle-orm";
import { updateWorkStatus } from "@/features/work/update-work-status";
import type { SegmentDto } from "./get-work-segments";
import {
  loadSegmentForEdit,
  SEGMENT_NOT_FOUND_ERROR,
  type SegmentAuthzError,
} from "./segment-authz";

const NOT_CONTIGUOUS_ERROR = "連続したセグメントを選択してください" as const;

type ErrorMessage = SegmentAuthzError | typeof NOT_CONTIGUOUS_ERROR;

export async function mergeSegments({
  segmentIds,
  userId,
}: {
  segmentIds: string[];
  userId: string;
}): Promise<Result<SegmentDto[], ErrorMessage>> {
  const loaded = await loadSegmentForEdit(segmentIds[0] ?? "", userId);

  if (!loaded.success) {
    return loaded;
  }

  const { workId } = loaded.data.segment;

  return db.transaction(async (tx) => {
    const all = await tx
      .select({
        id: segmentsTable.id,
        seq: segmentsTable.seq,
        sourceText: segmentsTable.sourceText,
        targetText: segmentsTable.targetText,
      })
      .from(segmentsTable)
      .where(eq(segmentsTable.workId, workId))
      .orderBy(asc(segmentsTable.seq));

    const selectedSet = new Set(segmentIds);
    const selected = all.filter((segment) => selectedSet.has(segment.id));

    if (selected.length !== segmentIds.length) {
      return fail<ErrorMessage>(SEGMENT_NOT_FOUND_ERROR);
    }

    // 連続性チェック（seq が連番であること）
    const firstSeq = selected[0]?.seq ?? 0;
    const isContiguous = selected.every(
      (segment, index) => segment.seq === firstSeq + index,
    );
    if (!isContiguous) {
      return fail<ErrorMessage>(NOT_CONTIGUOUS_ERROR);
    }

    const mergedSource = selected.map((segment) => segment.sourceText).join("");
    const mergedTarget = selected
      .map((segment) => segment.targetText?.trim())
      .filter(Boolean)
      .join(" ");

    const first = selected[0];
    if (!first) {
      return fail<ErrorMessage>(SEGMENT_NOT_FOUND_ERROR);
    }

    await tx
      .update(segmentsTable)
      .set({
        sourceText: mergedSource,
        status: mergedTarget ? SegmentStatus.Draft : SegmentStatus.Untranslated,
        targetText: mergedTarget || null,
      })
      .where(eq(segmentsTable.id, first.id));

    await tx.delete(segmentsTable).where(
      inArray(
        segmentsTable.id,
        selected.slice(1).map((segment) => segment.id),
      ),
    );

    await renumberSegments(tx, workId);
    await updateWorkStatus(tx, workId);

    return succeed(await readSegmentDtos(tx, workId));
  });
}

async function renumberSegments(
  tx: Parameters<Parameters<typeof db.transaction>[0]>[0],
  workId: string,
): Promise<void> {
  const remaining = await tx
    .select({ id: segmentsTable.id })
    .from(segmentsTable)
    .where(eq(segmentsTable.workId, workId))
    .orderBy(asc(segmentsTable.seq), asc(segmentsTable.createdAt));

  for (const [index, segment] of remaining.entries()) {
    await tx
      .update(segmentsTable)
      .set({ seq: index + 1 })
      .where(eq(segmentsTable.id, segment.id));
  }
}

export async function readSegmentDtos(
  tx: Parameters<Parameters<typeof db.transaction>[0]>[0],
  workId: string,
): Promise<SegmentDto[]> {
  const rows = await tx
    .select({
      id: segmentsTable.id,
      seq: segmentsTable.seq,
      sourceText: segmentsTable.sourceText,
      status: segmentsTable.status,
      targetText: segmentsTable.targetText,
    })
    .from(segmentsTable)
    .where(eq(segmentsTable.workId, workId))
    .orderBy(asc(segmentsTable.seq));

  return rows.map((row) => ({
    id: row.id,
    seq: row.seq,
    sourceText: row.sourceText,
    status: row.status as SegmentStatus,
    targetText: row.targetText,
  }));
}
