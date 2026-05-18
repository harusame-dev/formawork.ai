"use server";

import { updateTag } from "next/cache";
import * as v from "valibot";
import { CustomerTag } from "@/features/customer/tag";
import { createServerAction } from "@/libs/create-server-action";
import { deleteCustomerMemory } from "./delete-customer-memory";

const schema = v.object({
  customerId: v.pipe(v.string(), v.uuid()),
  memoryId: v.pipe(v.string(), v.uuid()),
});

export const deleteCustomerMemoryAction = createServerAction(
  deleteCustomerMemory,
  {
    name: "deleteCustomerMemoryAction",
    onSuccess: ({ input: { customerId } }) => {
      updateTag(CustomerTag.MemoriesByCustomerId(customerId));
    },
    schema,
  },
);
