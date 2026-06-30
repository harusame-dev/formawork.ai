import type { DbExecutor } from "@workspace/db/client";
import { SegmentStatus, segmentsTable } from "@workspace/db/schema/segment";
import { WorkStatus, worksTable } from "@workspace/db/schema/work";
import { eq, sql } from "drizzle-orm";

/**
 * ワーク配下のセグメント確定状況からワークのステータスを再計算して更新する。
 * - 全セグメント確定: 完了
 * - 1 つ以上訳出あり: 翻訳中
 * - すべて未訳: 未着手
 */
export async function updateWorkStatus(
  executor: DbExecutor,
  workId: string,
): Promise<void> {
  const [counts] = await executor
    .select({
      confirmed: sql<number>`count(*) filter (where ${segmentsTable.status} = ${SegmentStatus.Confirmed})`,
      total: sql<number>`count(*)`,
      translated: sql<number>`count(*) filter (where ${segmentsTable.status} <> ${SegmentStatus.Untranslated})`,
    })
    .from(segmentsTable)
    .where(eq(segmentsTable.workId, workId));

  const total = Number(counts?.total ?? 0);
  const confirmed = Number(counts?.confirmed ?? 0);
  const translated = Number(counts?.translated ?? 0);

  let status: WorkStatus = WorkStatus.NotStarted;
  if (total > 0 && confirmed === total) {
    status = WorkStatus.Completed;
  } else if (translated > 0) {
    status = WorkStatus.InProgress;
  }

  await executor
    .update(worksTable)
    .set({ status })
    .where(eq(worksTable.id, workId));
}
