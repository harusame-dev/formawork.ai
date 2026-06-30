import { fail, type Result, succeed } from "@harusame0616/result";
import { db } from "@workspace/db/client";
import { glossariesTable } from "@workspace/db/schema/glossary";
import { v7 as uuidv7 } from "uuid";
import { canEditGlossary } from "@/features/glossary/authz";
import type { RegisterGlossaryParams } from "./schema";

const FORBIDDEN_ERROR = "この操作を実行する権限がありません" as const;

export async function registerGlossary({
  note,
  projectId,
  sourceTerm,
  targetTerm,
  userId,
}: RegisterGlossaryParams & {
  userId: string;
}): Promise<Result<{ glossaryId: string }, typeof FORBIDDEN_ERROR>> {
  if (!(await canEditGlossary(projectId ?? null, userId))) {
    return fail(FORBIDDEN_ERROR);
  }

  const glossaryId = uuidv7();

  await db.insert(glossariesTable).values({
    id: glossaryId,
    note: note ?? "",
    projectId: projectId ?? null,
    sourceTerm,
    targetTerm,
  });

  return succeed({ glossaryId });
}
