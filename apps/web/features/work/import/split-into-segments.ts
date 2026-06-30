/**
 * 段落テキストをセグメント（原則 1 文）へ分割する純粋関数。
 *
 * 「。！？」を文末区切りとし、直後に閉じ括弧「」』）】 が続く場合は
 * その括弧までを同一文に含める（過分割を防ぐ）。
 */
const SENTENCE_END = /(?<=[。！？])(?![」』）】])/u;

export function splitIntoSegments(paragraphs: string[]): string[] {
  return paragraphs
    .flatMap((paragraph) => paragraph.split(SENTENCE_END))
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length > 0);
}

/**
 * 1 つのテキストを文境界（。！？の直後）で区切った配列を返す。
 * トリムや空要素除去は行わず、区切り文字を保持したまま分割する。
 * 対訳エディタの「セグメント分割」でクライアント・サーバー双方が
 * 同一の境界を得るために共用する。
 */
export function splitSentences(text: string): string[] {
  return text.split(/(?<=[。！？])/u).filter((part) => part.length > 0);
}
