import { fail, type Result, succeed } from "@harusame0616/result";
import { getLogger } from "@repo/logger/nextjs/server";
import { matchGlossary } from "@/features/glossary/match-glossary";
import { searchSimilarTm } from "@/features/translation-memory/search-tm";
import { embedText } from "@/libs/ai/embed.server";
import { generateTranslation } from "@/libs/ai/translate.server";
import type { TmMatch } from "./assist-types";
import { loadSegmentForEdit, type SegmentAuthzError } from "./segment-authz";

const TRANSLATE_FAILED_ERROR = "AI 英訳の生成に失敗しました" as const;

type ErrorMessage = SegmentAuthzError | typeof TRANSLATE_FAILED_ERROR;

export async function translateSegment({
  projectId,
  segmentId,
  userId,
}: {
  projectId: string;
  segmentId: string;
  userId: string;
}): Promise<Result<{ translation: string }, ErrorMessage>> {
  const loaded = await loadSegmentForEdit(segmentId, userId);

  if (!loaded.success) {
    return loaded;
  }

  if (loaded.data.projectId !== projectId) {
    return fail<ErrorMessage>(TRANSLATE_FAILED_ERROR);
  }

  const { segment } = loaded.data;
  const glossaryMatches = await matchGlossary({
    projectId,
    sourceText: segment.sourceText,
  });

  // 類似 TM の取得（埋め込み）は補助機能。埋め込み API のレート制限などで
  // 失敗しても翻訳本体は止めず、用語集ヒントのみで続行する。
  let tmMatches: TmMatch[] = [];
  try {
    const queryEmbedding = await embedText(segment.sourceText);
    tmMatches = await searchSimilarTm({ projectId, queryEmbedding });
  } catch (error) {
    const logger = await getLogger("translateSegment");
    logger.warn("類似 TM の取得に失敗しました（翻訳は続行）", { err: error });
  }

  try {
    const translation = await generateTranslation({
      glossaryMatches,
      sourceText: segment.sourceText,
      tmMatches,
    });
    return succeed({ translation });
  } catch (error) {
    const logger = await getLogger("translateSegment");
    logger.error("AI 英訳の生成に失敗しました", { err: error });
    return fail<ErrorMessage>(TRANSLATE_FAILED_ERROR);
  }
}
