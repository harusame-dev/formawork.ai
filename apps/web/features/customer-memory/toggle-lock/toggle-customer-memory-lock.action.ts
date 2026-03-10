"use server";

import { updateTag } from "next/cache";
import * as v from "valibot";
import { CustomerTag } from "@/features/customer/tag";
import { createServerAction } from "@/libs/create-server-action";
import { toggleCustomerMemoryLock } from "./toggle-customer-memory-lock";

const schema = v.object({
	memoryId: v.pipe(v.string(), v.uuid()),
});

export const toggleCustomerMemoryLockAction = createServerAction(
	toggleCustomerMemoryLock,
	{
		name: "toggleCustomerMemoryLockAction",
		onSuccess: ({ result: { customerId } }) => {
			updateTag(CustomerTag.MemoriesByCustomerId(customerId));
		},
		schema,
	},
);
