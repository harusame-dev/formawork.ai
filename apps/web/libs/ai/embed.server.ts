import { embed } from "ai";
import { getEmbeddingModel } from "@/config/ai";

/**
 * テキストを埋め込みベクトル（1536 次元）に変換する。
 * OpenAI SDK 経由で OpenAI text-embedding-3-small を利用する。
 */
export async function embedText(text: string): Promise<number[]> {
  const { embedding } = await embed({
    model: getEmbeddingModel(),
    value: text,
  });

  return embedding;
}
