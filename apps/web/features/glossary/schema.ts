import * as v from "valibot";

const SOURCE_TERM_MAX_LENGTH = 100;
const TARGET_TERM_MAX_LENGTH = 200;
const NOTE_MAX_LENGTH = 300;

export const sourceTermSchema = v.pipe(
  v.string("原語を入力してください"),
  v.minLength(1, "原語を入力してください"),
  v.maxLength(
    SOURCE_TERM_MAX_LENGTH,
    `原語は${SOURCE_TERM_MAX_LENGTH}文字以内で入力してください`,
  ),
);

export const targetTermSchema = v.pipe(
  v.string("訳語を入力してください"),
  v.minLength(1, "訳語を入力してください"),
  v.maxLength(
    TARGET_TERM_MAX_LENGTH,
    `訳語は${TARGET_TERM_MAX_LENGTH}文字以内で入力してください`,
  ),
);

export const noteSchema = v.union([
  v.literal(""),
  v.pipe(
    v.string(),
    v.maxLength(
      NOTE_MAX_LENGTH,
      `メモは${NOTE_MAX_LENGTH}文字以内で入力してください`,
    ),
  ),
]);
