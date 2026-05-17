import * as v from "valibot";
import { UserRole } from "@/features/auth/user/role";

export const userEmailSchema = v.pipe(
	v.string("メールアドレスを入力してください"),
	v.minLength(1, "メールアドレスを入力してください"),
	v.email("正しいメールアドレス形式で入力してください"),
	v.maxLength(254, "メールアドレスは254文字以内で入力してください"),
);

export const userOrganizationIdSchema = v.pipe(
	v.string("組織を選択してください"),
	v.uuid("組織を選択してください"),
);

export const userRoleSchema = v.picklist(
	[UserRole.Admin, UserRole.OrgUser],
	"ロールを選択してください",
);

export const userIdSchema = v.pipe(
	v.string("ユーザーを指定してください"),
	v.uuid("ユーザーを指定してください"),
);
