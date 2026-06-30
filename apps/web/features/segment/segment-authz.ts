import { fail, type Result, succeed } from "@harusame0616/result";
import { db } from "@workspace/db/client";
import type { SelectSegment } from "@workspace/db/schema/segment";
import { segmentsTable } from "@workspace/db/schema/segment";
import { worksTable } from "@workspace/db/schema/work";
import { eq } from "drizzle-orm";
import { canEditProject, getProjectAccess } from "@/features/project/authz";

export const SEGMENT_NOT_FOUND_ERROR = "セグメントが見つかりません" as const;
const SEGMENT_FORBIDDEN_ERROR = "この操作を実行する権限がありません" as const;

export type SegmentAuthzError =
  | typeof SEGMENT_NOT_FOUND_ERROR
  | typeof SEGMENT_FORBIDDEN_ERROR;

/**
 * セグメント編集の認可を行い、対象セグメントと所属プロジェクト ID を返す。
 * セグメント → ワーク → プロジェクトアクセスを辿り、編集権限を確認する。
 */
export async function loadSegmentForEdit(
  segmentId: string,
  userId: string,
): Promise<
  Result<{ projectId: string; segment: SelectSegment }, SegmentAuthzError>
> {
  const segment = await db.query.segmentsTable.findFirst({
    where: eq(segmentsTable.id, segmentId),
  });

  if (!segment) {
    return fail(SEGMENT_NOT_FOUND_ERROR);
  }

  const work = await db.query.worksTable.findFirst({
    where: eq(worksTable.id, segment.workId),
  });

  if (!work) {
    return fail(SEGMENT_NOT_FOUND_ERROR);
  }

  const access = await getProjectAccess(work.projectId, userId);

  if (!access) {
    return fail(SEGMENT_NOT_FOUND_ERROR);
  }

  if (!canEditProject(access)) {
    return fail(SEGMENT_FORBIDDEN_ERROR);
  }

  return succeed({ projectId: work.projectId, segment });
}
