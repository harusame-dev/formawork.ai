"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import * as v from "valibot";
import { UserRole } from "@/features/auth/get-user-role";
import { createServerAction } from "@/libs/create-server-action";
import { StaffTag } from "@/features/staff/tag";
import { editStaff } from "./edit-staff";
import { editStaffSchema } from "./schema";

export const editStaffAction = createServerAction(
  (parameters) => editStaff(parameters),
  {
    name: "editStaffAction",
    onSuccess: ({ input: { staffId } }) => {
      updateTag(StaffTag.List);
      updateTag(StaffTag.Detail(staffId));

      redirect(`/staffs/${staffId}`);
    },
    role: [UserRole.Admin],
    schema: v.object({
      ...editStaffSchema.entries,
      authUserId: v.string(),
      originalRole: v.string(),
      staffId: v.string(),
    }),
  },
);
