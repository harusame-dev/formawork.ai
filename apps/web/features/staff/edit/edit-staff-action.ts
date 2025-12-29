"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import * as v from "valibot";
import { UserRole } from "@/features/auth/get-user-role";
import { createServerAction } from "@/libs/create-server-action";
import { StaffTag } from "../tag";
import { editStaff } from "./edit-staff";

export const editStaffAction = createServerAction(
	(params) => editStaff(params),
	{
		name: "editStaffAction",
		onSuccess: ({ input: { staffId } }) => {
			updateTag(StaffTag.List);
			updateTag(StaffTag.Detail(staffId));

			redirect(`/staffs/${staffId}`);
		},
		role: [UserRole.Admin],
		schema: v.object({
			authUserId: v.string(),
			email: v.pipe(
				v.string("メールアドレスを入力してください"),
				v.minLength(1, "メールアドレスを入力してください"),
				v.email("正しいメールアドレス形式で入力してください"),
				v.maxLength(254, "メールアドレスは254文字以内で入力してください"),
			),
			firstName: v.pipe(
				v.string("名を入力してください"),
				v.minLength(1, "名を入力してください"),
				v.maxLength(24, "名は24文字以内で入力してください"),
			),
			lastName: v.pipe(
				v.string("姓を入力してください"),
				v.minLength(1, "姓を入力してください"),
				v.maxLength(24, "姓は24文字以内で入力してください"),
			),
			originalRole: v.string(),
			role: v.picklist(["admin", "user"], "ロールを選択してください"),
			staffId: v.string(),
		}),
	},
);
