import { db } from "@workspace/db/client";
import { glossariesTable } from "@workspace/db/schema/glossary";
import { eq, isNull, or } from "drizzle-orm";
import type { GlossaryMatch } from "@/features/segment/assist-types";

/**
 * 原文に含まれる用語を、プロジェクト用語集 + 共通用語集から抽出する。
 * 部分一致で照合し、より長い（具体的な）用語を優先して上位 limit 件返す。
 */
export async function matchGlossary({
  limit = 20,
  projectId,
  sourceText,
}: {
  limit?: number;
  projectId: string;
  sourceText: string;
}): Promise<GlossaryMatch[]> {
  const rows = await db
    .select({
      projectId: glossariesTable.projectId,
      sourceTerm: glossariesTable.sourceTerm,
      targetTerm: glossariesTable.targetTerm,
    })
    .from(glossariesTable)
    .where(
      or(
        eq(glossariesTable.projectId, projectId),
        isNull(glossariesTable.projectId),
      ),
    );

  return rows
    .filter((row) => sourceText.includes(row.sourceTerm))
    .toSorted((a, b) => b.sourceTerm.length - a.sourceTerm.length)
    .slice(0, limit)
    .map((row) => ({
      isCommon: row.projectId === null,
      sourceTerm: row.sourceTerm,
      targetTerm: row.targetTerm,
    }));
}
