import { db } from "@workspace/db/client";
import type { SegmentStatus } from "@workspace/db/schema/segment";
import { segmentsTable } from "@workspace/db/schema/segment";
import type { WorkStatus } from "@workspace/db/schema/work";
import { worksTable } from "@workspace/db/schema/work";
import { asc, eq } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { WorkTag } from "@/features/work/tag";

export interface SegmentDto {
  id: string;
  seq: number;
  sourceText: string;
  status: SegmentStatus;
  targetText: string | null;
}

interface WorkWithSegments {
  segments: SegmentDto[];
  work: {
    id: string;
    name: string;
    projectId: string;
    status: WorkStatus;
  };
}

export async function getWorkSegments(
  workId: string,
): Promise<WorkWithSegments | null> {
  "use cache";
  cacheLife("permanent");
  cacheTag(WorkTag.SegmentsByWorkId(workId), WorkTag.Detail(workId));

  const work = await db.query.worksTable.findFirst({
    where: eq(worksTable.id, workId),
  });

  if (!work) {
    return null;
  }

  const segments = await db
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

  return {
    segments: segments.map((segment) => ({
      id: segment.id,
      seq: segment.seq,
      sourceText: segment.sourceText,
      status: segment.status as SegmentStatus,
      targetText: segment.targetText,
    })),
    work: {
      id: work.id,
      name: work.name,
      projectId: work.projectId,
      status: work.status as WorkStatus,
    },
  };
}
