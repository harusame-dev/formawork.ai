import { generateText } from "ai";
import { getTranslationModel } from "@/config/ai";
import type { GlossaryMatch, TmMatch } from "@/features/segment/assist-types";
import { constructProtectedPrompt } from "@/libs/ai/prompt";

/**
 * 原文（和文）を、類似の過去訳（TM）と用語集をヒントに英訳する。
 * OpenAI SDK 経由で OpenAI のモデルを利用する。
 */
export async function generateTranslation({
  glossaryMatches,
  sourceText,
  tmMatches,
}: {
  glossaryMatches: GlossaryMatch[];
  sourceText: string;
  tmMatches: TmMatch[];
}): Promise<string> {
  const hints: string[] = [];

  if (glossaryMatches.length > 0) {
    hints.push(
      "",
      "## 用語集（訳語のヒント。文脈に合う場合は優先的に使用してください）",
      ...glossaryMatches.map(
        (glossary) => `- ${glossary.sourceTerm} → ${glossary.targetTerm}`,
      ),
    );
  }

  if (tmMatches.length > 0) {
    hints.push(
      "",
      "## 類似の過去訳（文体・用語の一貫性のため参照してください）",
      ...tmMatches.map(
        (tm) => `- 原文: ${tm.sourceText}\n  訳文: ${tm.targetText}`,
      ),
    );
  }

  const systemInstructions = [
    "あなたはプロの和文英訳者です。与えられた日本語の原文を、自然で正確なビジネス英語に翻訳してください。",
    "出力は英訳の本文のみとし、注釈・説明・引用符・前置きは一切付けないでください。",
    ...hints,
  ].join("\n");

  const { text } = await generateText({
    model: getTranslationModel(),
    prompt: constructProtectedPrompt({
      systemInstructions,
      userInput: sourceText,
    }),
    temperature: 0.3,
  });

  return text.trim();
}
