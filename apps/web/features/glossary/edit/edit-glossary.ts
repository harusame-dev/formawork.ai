import { fail, type Result, succeed } from "@harusame0616/result";
import { db } from "@workspace/db/client";
import { glossariesTable } from "@workspace/db/schema/glossary";
import { eq } from "drizzle-orm";
import { canEditGlossary } from "@/features/glossary/authz";
import type { EditGlossaryParams } from "./schema";

const GLOSSARY_NOT_FOUND_ERROR = "用語が見つかりません" as const;
const FORBIDDEN_ERROR = "この操作を実行する権限がありません" as const;

type ErrorMessage = typeof GLOSSARY_NOT_FOUND_ERROR | typeof FORBIDDEN_ERROR;

export async function editGlossary({
  glossaryId,
  note,
  sourceTerm,
  targetTerm,
  userId,
}: EditGlossaryParams & {
  userId: string;
}): Promise<Result<{ projectId: string | null }, ErrorMessage>> {
  const existing = await db
    .select({
      id: glossariesTable.id,
      projectId: glossariesTable.projectId,
    })
    .from(glossariesTable)
    .where(eq(glossariesTable.id, glossaryId))
    .then((rows) => rows[0]);

  if (!existing) {
    return fail(GLOSSARY_NOT_FOUND_ERROR);
  }

  if (!(await canEditGlossary(existing.projectId, userId))) {
    return fail(FORBIDDEN_ERROR);
  }

  await db
    .update(glossariesTable)
    .set({ note: note ?? "", sourceTerm, targetTerm })
    .where(eq(glossariesTable.id, glossaryId));

  return succeed({ projectId: existing.projectId });
}
