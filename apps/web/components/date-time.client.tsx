"use client";

import { useSyncExternalStore } from "react";

interface DateTimeProps {
  date: Date;
}

// useSyncExternalStore の subscribe 用ダミー関数。
// 値が変化しないため購読は不要だが、フックの API として必須なのでモジュールスコープに切り出している。
const noop = (): void => {};
const subscribe = (): (() => void) => noop;

export function DateTime({ date }: DateTimeProps): JSX.Element {
  const formatted = useSyncExternalStore(
    subscribe,
    (): string =>
      date.toLocaleString("ja-JP", {
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        month: "long",
        year: "numeric",
      }),
    (): string =>
      date.toLocaleString("ja-JP", {
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        month: "long",
        timeZone: "Asia/Tokyo",
        year: "numeric",
      }),
  );

  return <time dateTime={date.toISOString()}>{formatted}</time>;
}
