"use server";

import { succeed } from "@harusame0616/result";
import { updateTag } from "next/cache";
import * as v from "valibot";
import { CustomerTag } from "@/features/customer/tag";
import { createServerAction } from "@/libs/create-server-action";
import { deleteCustomerNote } from "./delete-customer-note";

const deleteCustomerNoteSchema = v.object({
  customerNoteId: v.pipe(v.string(), v.uuid()),
});

export const deleteCustomerNoteAction = createServerAction(
  async (input, { role, userId }) => {
    const result = await deleteCustomerNote({
      customerNoteId: input.customerNoteId,
      user: { role, userId },
    });

    if (!result.success) {
      return result;
    }

    return succeed({ customerId: result.data.customerId });
  },
  {
    name: "deleteCustomerNoteAction",
    onSuccess: ({ result: { customerId } }) => {
      updateTag(CustomerTag.NotesByCustomerId(customerId));
    },
    schema: deleteCustomerNoteSchema,
  },
);
