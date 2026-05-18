/**
 * MSW ハンドラー定義
 *
 * デフォルトで使用するリクエストハンドラーを定義する。
 * テストごとに worker.use() でオーバーライド可能。
 */
import { HttpResponse, http } from "msw";

export const handlers = [
  // デフォルトハンドラー: アドバイス未取得状態
  http.get("/api/customer-notes/:noteId/advice", () => {
    return HttpResponse.json(null);
  }),
];
