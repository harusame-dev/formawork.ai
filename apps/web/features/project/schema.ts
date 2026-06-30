import { ProjectVisibility } from "@workspace/db/schema/project";
import * as v from "valibot";

const PROJECT_NAME_MAX_LENGTH = 100;
const PROJECT_DESCRIPTION_MAX_LENGTH = 500;

export const projectNameSchema = v.pipe(
  v.string("プロジェクト名を入力してください"),
  v.minLength(1, "プロジェクト名を入力してください"),
  v.maxLength(
    PROJECT_NAME_MAX_LENGTH,
    `プロジェクト名は${PROJECT_NAME_MAX_LENGTH}文字以内で入力してください`,
  ),
);

export const projectDescriptionSchema = v.union([
  v.literal(""),
  v.pipe(
    v.string(),
    v.maxLength(
      PROJECT_DESCRIPTION_MAX_LENGTH,
      `説明は${PROJECT_DESCRIPTION_MAX_LENGTH}文字以内で入力してください`,
    ),
  ),
]);

export const projectVisibilitySchema = v.picklist(
  [ProjectVisibility.Public, ProjectVisibility.Private],
  "可視性を選択してください",
);
