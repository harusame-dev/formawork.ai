import { db } from "@workspace/db/client";
import { glossariesTable } from "@workspace/db/schema/glossary";
import { asc, isNull } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { GlossaryTag } from "@/features/glossary/tag";

interface CommonGlossaryItem {
  id: string;
  note: string;
  sourceTerm: string;
  targetTerm: string;
}

export async function getCommonGlossaries(): Promise<CommonGlossaryItem[]> {
  "use cache";
  cacheLife("permanent");
  cacheTag(GlossaryTag.Common);

  const rows = await db
    .select({
      id: glossariesTable.id,
      note: glossariesTable.note,
      sourceTerm: glossariesTable.sourceTerm,
      targetTerm: glossariesTable.targetTerm,
    })
    .from(glossariesTable)
    .where(isNull(glossariesTable.projectId))
    .orderBy(asc(glossariesTable.sourceTerm));

  return rows;
}
