"use server";

import { updateTag } from "next/cache";
import * as v from "valibot";
import { CustomerTag } from "@/features/customer/tag";
import { createServerAction } from "@/libs/create-server-action";
import { toggleCustomerMemoryLock } from "./toggle-customer-memory-lock";

const schema = v.object({
	customerId: v.pipe(v.string(), v.uuid()),
	memoryId: v.pipe(v.string(), v.uuid()),
});

export const toggleCustomerMemoryLockAction = createServerAction(
	async (input) => toggleCustomerMemoryLock(input.memoryId),
	{
		name: "toggleCustomerMemoryLockAction",
		onSuccess: ({ input }) => {
			updateTag(CustomerTag.MemoryCrud(input.customerId));
		},
		schema,
	},
);
