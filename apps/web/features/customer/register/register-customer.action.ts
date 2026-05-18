"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { UserRole } from "@/features/auth/get-user-role";
import { createServerAction } from "@/libs/create-server-action";
import { CustomerTag } from "@/features/customer/tag";
import { registerCustomer } from "./register-customer";
import { registerCustomerSchema } from "./schema";

export const registerCustomerAction = createServerAction(registerCustomer, {
  name: "registerCustomerAction",
  onSuccess: ({ result: { customerId } }) => {
    updateTag(CustomerTag.List);

    redirect(`/customers/${customerId}`);
  },
  role: [UserRole.Admin],
  schema: registerCustomerSchema,
});
