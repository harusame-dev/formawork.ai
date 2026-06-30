import { db } from "@workspace/db/client";
import { SegmentStatus, segmentsTable } from "@workspace/db/schema/segment";
import type { WorkStatus } from "@workspace/db/schema/work";
import { worksTable } from "@workspace/db/schema/work";
import { desc, eq, sql } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { WorkTag } from "@/features/work/tag";

export interface WorkListItem {
  confirmedCount: number;
  id: string;
  name: string;
  sourceFileName: string;
  status: WorkStatus;
  totalCount: number;
}

export async function getWorks(projectId: string): Promise<WorkListItem[]> {
  "use cache";
  cacheLife("permanent");
  cacheTag(WorkTag.ListByProjectId(projectId));

  const rows = await db
    .select({
      confirmedCount: sql<number>`count(*) filter (where ${segmentsTable.status} = ${SegmentStatus.Confirmed})`,
      id: worksTable.id,
      name: worksTable.name,
      sourceFileName: worksTable.sourceFileName,
      status: worksTable.status,
      totalCount: sql<number>`count(${segmentsTable.id})`,
    })
    .from(worksTable)
    .leftJoin(segmentsTable, eq(segmentsTable.workId, worksTable.id))
    .where(eq(worksTable.projectId, projectId))
    .groupBy(worksTable.id)
    .orderBy(desc(worksTable.createdAt));

  return rows.map((row) => ({
    confirmedCount: Number(row.confirmedCount),
    id: row.id,
    name: row.name,
    sourceFileName: row.sourceFileName,
    status: row.status as WorkStatus,
    totalCount: Number(row.totalCount),
  }));
}
