import { db } from "@workspace/db/client";
import { staffsTable } from "@workspace/db/schema/staff";
import { asc } from "drizzle-orm";

export interface CandidateUser {
  name: string;
  userId: string;
}

/** メンバー追加候補となる全ユーザー（スタッフ）を取得する */
export async function getCandidateUsers(): Promise<CandidateUser[]> {
  const rows = await db
    .select({
      firstName: staffsTable.firstName,
      lastName: staffsTable.lastName,
      staffId: staffsTable.staffId,
    })
    .from(staffsTable)
    .orderBy(asc(staffsTable.lastName), asc(staffsTable.firstName));

  return rows.map((row) => ({
    name: `${row.lastName} ${row.firstName}`,
    userId: row.staffId,
  }));
}
