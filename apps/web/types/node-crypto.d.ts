// Node.js 24.16.0 で追加された crypto.randomUUIDv7() の型補完。
// 2026-06 時点で @types/node がまだ randomUUIDv7 の型を提供していないため、
// module augmentation で一時的に補う。@types/node が対応したら本ファイルを削除すること。
// 参照: https://github.com/nodejs/node/pull/62553 (RFC 9562 version 7)
declare module "node:crypto" {
  /**
   * RFC 9562 version 7 のランダム UUID を生成する。
   * 先頭 48bit にミリ秒精度の Unix タイムスタンプを持ち、残りは
   * 暗号学的に安全な乱数で構成されるため、時系列でソート可能な DB キーに適する。
   */
  function randomUUIDv7(options?: RandomUUIDOptions): UUID;
}
