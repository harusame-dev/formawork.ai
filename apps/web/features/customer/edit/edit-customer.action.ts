"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { UserRole } from "@/features/auth/get-user-role";
import { CustomerTag } from "@/features/customer/tag";
import { createServerAction } from "@/libs/create-server-action";
import { editCustomer } from "./edit-customer";
import { editCustomerSchema } from "./schema";

export const editCustomerAction = createServerAction(editCustomer, {
  name: "editCustomerAction",
  onSuccess: ({ input: { customerId } }) => {
    updateTag(CustomerTag.List);
    updateTag(CustomerTag.Detail(customerId));

    redirect(`/customers/${customerId}`);
  },
  role: [UserRole.Admin],
  schema: editCustomerSchema,
});
