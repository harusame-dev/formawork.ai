/**
 * MSW Browser Worker セットアップ
 *
 * Vitest Browser Mode でのテスト用に Service Worker をセットアップする。
 */
import { setupWorker } from "msw/browser";
import { handlers } from "./handlers";

export const worker = setupWorker(...handlers);
