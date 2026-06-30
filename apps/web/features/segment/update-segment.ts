import { type Result, succeed } from "@harusame0616/result";
import { db } from "@workspace/db/client";
import { SegmentStatus, segmentsTable } from "@workspace/db/schema/segment";
import { eq } from "drizzle-orm";
import { updateWorkStatus } from "@/features/work/update-work-status";
import { loadSegmentForEdit, type SegmentAuthzError } from "./segment-authz";

export async function updateSegment({
  segmentId,
  targetText,
  userId,
}: {
  segmentId: string;
  targetText: string;
  userId: string;
}): Promise<Result<{ status: SegmentStatus }, SegmentAuthzError>> {
  const loaded = await loadSegmentForEdit(segmentId, userId);

  if (!loaded.success) {
    return loaded;
  }

  const status =
    targetText.trim().length === 0
      ? SegmentStatus.Untranslated
      : SegmentStatus.Draft;

  await db.transaction(async (tx) => {
    await tx
      .update(segmentsTable)
      .set({ status, targetText })
      .where(eq(segmentsTable.id, segmentId));
    await updateWorkStatus(tx, loaded.data.segment.workId);
  });

  return succeed({ status });
}
