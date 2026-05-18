import * as v from "valibot";

// 顧客登録用の定数
const CUSTOMER_NAME_MAX_LENGTH = 24;
const CUSTOMER_EMAIL_MAX_LENGTH = 254;
const CUSTOMER_PHONE_MAX_LENGTH = 20;
const CUSTOMER_KANA_MAX_LENGTH = 48;
const CUSTOMER_ADDRESS_MAX_LENGTH = 200;
const CUSTOMER_REMARKS_MAX_LENGTH = 4096;

// ISO 5218 性別コード定数
export const Gender = {
  Female: 2,
  Male: 1,
  NotApplicable: 9,
  Unknown: 0,
} as const;

const genders = [0, 1, 2, 9] as const;
export type Gender = (typeof genders)[number];

export const GENDER_LABELS: Record<Gender, string> = {
  [Gender.Unknown]: "不明",
  [Gender.Male]: "男性",
  [Gender.Female]: "女性",
  [Gender.NotApplicable]: "適用不能",
};

export const emailSchema = v.union([
  v.literal(""),
  v.pipe(
    v.string(),
    v.email("正しいメールアドレス形式で入力してください"),
    v.maxLength(
      CUSTOMER_EMAIL_MAX_LENGTH,
      `メールアドレスは${CUSTOMER_EMAIL_MAX_LENGTH}文字以内で入力してください`,
    ),
  ),
]);

export const lastNameSchema = v.pipe(
  v.string("姓を入力してください"),
  v.minLength(1, "姓を入力してください"),
  v.maxLength(
    CUSTOMER_NAME_MAX_LENGTH,
    `姓は${CUSTOMER_NAME_MAX_LENGTH}文字以内で入力してください`,
  ),
);

export const firstNameSchema = v.pipe(
  v.string("名を入力してください"),
  v.minLength(1, "名を入力してください"),
  v.maxLength(
    CUSTOMER_NAME_MAX_LENGTH,
    `名は${CUSTOMER_NAME_MAX_LENGTH}文字以内で入力してください`,
  ),
);
export const phoneSchema = v.union([
  v.literal(""),
  v.pipe(
    v.string(),
    v.transform((value) => value.replaceAll("-", "")),
    v.regex(/^\d*$/, "電話番号は数字のみで入力してください"),
    v.maxLength(
      CUSTOMER_PHONE_MAX_LENGTH,
      `電話番号は${CUSTOMER_PHONE_MAX_LENGTH}文字以内で入力してください`,
    ),
  ),
]);

export const birthDateSchema = v.union([
  v.literal(""),
  v.pipe(
    v.string(),
    v.regex(/^\d{4}-\d{2}-\d{2}$/, "正しい日付形式で入力してください"),
  ),
]);

export const genderSchema = v.picklist(genders, "性別を選択してください");

export const remarksSchema = v.union([
  v.literal(""),
  v.pipe(
    v.string(),
    v.maxLength(
      CUSTOMER_REMARKS_MAX_LENGTH,
      `備考は${CUSTOMER_REMARKS_MAX_LENGTH}文字以内で入力してください`,
    ),
  ),
]);

export const addressSchema = v.union([
  v.literal(""),
  v.pipe(
    v.string(),
    v.maxLength(
      CUSTOMER_ADDRESS_MAX_LENGTH,
      `住所は${CUSTOMER_ADDRESS_MAX_LENGTH}文字以内で入力してください`,
    ),
  ),
]);

export const lastNameKanaSchema = v.union([
  v.literal(""),
  v.pipe(
    v.string(),
    v.regex(/^[ぁ-んー]*$/, "姓（かな）はひらがなで入力してください"),
    v.maxLength(
      CUSTOMER_KANA_MAX_LENGTH,
      `姓（かな）は${CUSTOMER_KANA_MAX_LENGTH}文字以内で入力してください`,
    ),
  ),
]);

export const firstNameKanaSchema = v.union([
  v.literal(""),
  v.pipe(
    v.string(),
    v.regex(/^[ぁ-んー]*$/, "名（かな）はひらがなで入力してください"),
    v.maxLength(
      CUSTOMER_KANA_MAX_LENGTH,
      `名（かな）は${CUSTOMER_KANA_MAX_LENGTH}文字以内で入力してください`,
    ),
  ),
]);
