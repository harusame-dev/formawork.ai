import * as v from "valibot";

const memoryCategoryValues = [1, 2, 3, 4, 5, 6] as const;

export const memoryCategorySchema = v.picklist(
	memoryCategoryValues,
	"不正なカテゴリ値です",
);
