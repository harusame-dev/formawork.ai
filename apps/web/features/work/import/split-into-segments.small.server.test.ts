import { expect, test } from "vitest";
import { splitIntoSegments } from "./split-into-segments";

test("句点で文を分割する", () => {
  expect(splitIntoSegments(["これは一文目です。これは二文目です。"])).toEqual([
    "これは一文目です。",
    "これは二文目です。",
  ]);
});

test("感嘆符・疑問符でも分割する", () => {
  expect(splitIntoSegments(["本当ですか？はい！"])).toEqual([
    "本当ですか？",
    "はい！",
  ]);
});

test("句点の直後に閉じ括弧が続く場合は同一文に含める", () => {
  expect(splitIntoSegments(["彼は「行きます。」と言った。"])).toEqual([
    "彼は「行きます。」と言った。",
  ]);
});

test("複数段落をまたいで分割する", () => {
  expect(
    splitIntoSegments(["一段落目の文。", "二段落目の文。最後の文。"]),
  ).toEqual(["一段落目の文。", "二段落目の文。", "最後の文。"]);
});

test("空白のみの断片や空文字列は除外する", () => {
  expect(splitIntoSegments(["  ", "文です。   ", ""])).toEqual(["文です。"]);
});

test("文末記号が無い段落は 1 セグメントとして扱う", () => {
  expect(splitIntoSegments(["見出しテキスト"])).toEqual(["見出しテキスト"]);
});
