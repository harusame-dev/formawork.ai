"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { UserRole } from "@/features/auth/get-user-role";
import { createServerAction } from "@/libs/create-server-action";
import { StaffTag } from "@/features/staff/tag";
import { registerStaff } from "./register-staff";
import { registerStaffSchema } from "./schema";

export const registerStaffAction = createServerAction(registerStaff, {
  name: "registerStaffAction",
  onSuccess: () => {
    updateTag(StaffTag.List);

    redirect("/staffs");
  },
  role: [UserRole.Admin],
  schema: registerStaffSchema,
});
