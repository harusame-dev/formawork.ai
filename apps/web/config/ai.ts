/** biome-ignore-all lint/complexity/useLiteralKeys: ts(4111) */
import { type OpenAIProvider, createOpenAI } from "@ai-sdk/openai";
import type { EmbeddingModel, LanguageModel } from "ai";
import * as v from "valibot";

const openAiConfigSchema = v.object({
  apiKey: v.pipe(
    v.string("OPENAI_API_KEY is required"),
    v.nonEmpty("OPENAI_API_KEY must not be empty"),
  ),
});

type OpenAiConfig = v.InferOutput<typeof openAiConfigSchema>;

/**
 * OpenAI の設定。
 *
 * `OPENAI_API_KEY` の存在を検証し、ユースケース実行前にフェイルファストするためのヘルパー。
 */
function getOpenAiConfig(): OpenAiConfig {
  return v.parse(openAiConfigSchema, {
    apiKey: process.env["OPENAI_API_KEY"],
  });
}

/**
 * OpenAI プロバイダを生成する。
 *
 * Vercel AI Gateway を経由せず OpenAI SDK 経由で直接 API を呼び出す。
 */
function createOpenAiProvider(): OpenAIProvider {
  const { apiKey } = getOpenAiConfig();
  return createOpenAI({ apiKey });
}

/** AI 英訳に使用するモデル */
export function getTranslationModel(): LanguageModel {
  return createOpenAiProvider()("gpt-4o-mini");
}

/** 埋め込みに使用するモデル（OpenAI text-embedding-3-small / 1536 次元） */
export function getEmbeddingModel(): EmbeddingModel {
  return createOpenAiProvider().textEmbeddingModel("text-embedding-3-small");
}
