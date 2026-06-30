import mammoth from "mammoth";

/**
 * docx のバイナリから段落テキストを抽出する薄いラッパー。
 * 書式は捨て、段落（改行区切り）の配列として返す。
 */
export async function extractParagraphs(buffer: Buffer): Promise<string[]> {
  const result = await mammoth.extractRawText({ buffer });

  return result.value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}
