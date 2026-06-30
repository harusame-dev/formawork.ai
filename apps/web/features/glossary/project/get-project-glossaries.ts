import { db } from "@workspace/db/client";
import { glossariesTable } from "@workspace/db/schema/glossary";
import { asc, eq } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { GlossaryTag } from "@/features/glossary/tag";

interface ProjectGlossaryItem {
  id: string;
  note: string;
  sourceTerm: string;
  targetTerm: string;
}

export async function getProjectGlossaries(
  projectId: string,
): Promise<ProjectGlossaryItem[]> {
  "use cache";
  cacheLife("permanent");
  cacheTag(GlossaryTag.ByProjectId(projectId));

  const rows = await db
    .select({
      id: glossariesTable.id,
      note: glossariesTable.note,
      sourceTerm: glossariesTable.sourceTerm,
      targetTerm: glossariesTable.targetTerm,
    })
    .from(glossariesTable)
    .where(eq(glossariesTable.projectId, projectId))
    .orderBy(asc(glossariesTable.sourceTerm));

  return rows;
}
