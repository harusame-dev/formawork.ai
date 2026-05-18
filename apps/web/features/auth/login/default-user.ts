import * as v from "valibot";

// デモ用途でログイン画面にデフォルト値を表示するための設定です。
// NEXT_PUBLIC_ プレフィックスは意図的で、クライアントに公開されます。
export const defaultUserName = v.parse(
  v.optional(v.string(), ""),
  process.env["NEXT_PUBLIC_DEFAULT_USERNAME"],
);

export const defaultPassword = v.parse(
  v.optional(v.string(), ""),
  process.env["NEXT_PUBLIC_DEFAULT_PASSWORD"],
);
