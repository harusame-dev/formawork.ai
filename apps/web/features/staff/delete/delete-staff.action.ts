"use server";

import { fail } from "@harusame0616/result";
import { updateTag } from "next/cache";
import { RedirectType, redirect } from "next/navigation";
import * as v from "valibot";
import { UserRole } from "@/features/auth/get-user-role";
import { getUserStaffId } from "@/features/auth/get-user-staff-id";
import { StaffTag } from "@/features/staff/tag";
import { createServerAction } from "@/libs/create-server-action";
import { deleteStaff } from "./delete-staff";

const deleteStaffSchema = v.object({
	staffId: v.pipe(v.string(), v.uuid()),
});

export const deleteStaffAction = createServerAction(
	async ({ staffId }) => {
		const currentUserStaffId = await getUserStaffId();

		if (!currentUserStaffId) {
			return fail("認証に失敗しました");
		}

		return deleteStaff({ currentUserStaffId, staffId });
	},
	{
		name: "deleteStaffAction",
		onSuccess: ({ input: { staffId } }) => {
			updateTag(StaffTag.Detail(staffId));
			updateTag(StaffTag.List);

			redirect("/staffs", RedirectType.replace);
		},
		role: [UserRole.Admin],
		schema: deleteStaffSchema,
	},
);
