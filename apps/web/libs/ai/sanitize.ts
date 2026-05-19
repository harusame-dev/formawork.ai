export function sanitizeUserInput(input: string): string {
  // 制御文字の除去はセキュリティ対策として意図的に実施（タブ・改行は除外）
  // eslint-disable-next-line no-control-regex
  const controlCharRegex = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;
  return input
    .replaceAll(controlCharRegex, "")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}
