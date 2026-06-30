import { fail, type Result, succeed } from "@harusame0616/result";
import { db } from "@workspace/db/client";
import { segmentsTable } from "@workspace/db/schema/segment";
import { worksTable } from "@workspace/db/schema/work";
import { eq } from "drizzle-orm";
import { matchGlossary } from "@/features/glossary/match-glossary";
import { getProjectAccess } from "@/features/project/authz";
import { searchSimilarTm } from "@/features/translation-memory/search-tm";
import { embedText } from "@/libs/ai/embed.server";
import type { SegmentAssist } from "./assist-types";

const NOT_FOUND_ERROR = "セグメントが見つかりません" as const;

type ErrorMessage = typeof NOT_FOUND_ERROR;

export async function getSegmentAssist({
  projectId,
  segmentId,
  userId,
}: {
  projectId: string;
  segmentId: string;
  userId: string;
}): Promise<Result<SegmentAssist, ErrorMessage>> {
  const segment = await db.query.segmentsTable.findFirst({
    where: eq(segmentsTable.id, segmentId),
  });

  if (!segment) {
    return fail(NOT_FOUND_ERROR);
  }

  const work = await db.query.worksTable.findFirst({
    where: eq(worksTable.id, segment.workId),
  });

  if (!work || work.projectId !== projectId) {
    return fail(NOT_FOUND_ERROR);
  }

  const access = await getProjectAccess(projectId, userId);

  if (!access) {
    return fail(NOT_FOUND_ERROR);
  }

  // 用語集マッチは埋め込み不要なので先に取得
  const glossaryMatches = await matchGlossary({
    projectId,
    sourceText: segment.sourceText,
  });

  try {
    const queryEmbedding = await embedText(segment.sourceText);
    const tmMatches = await searchSimilarTm({ projectId, queryEmbedding });
    return succeed({ glossaryMatches, tmMatches });
  } catch {
    // 埋め込み/類似検索に失敗しても用語集だけは返す
    return succeed({ glossaryMatches, tmMatches: [] });
  }
}
