"use server";

import { updateTag } from "next/cache";
import * as v from "valibot";
import { CustomerTag } from "@/features/customer/tag";
import { createServerAction } from "@/libs/create-server-action";
import {
	MEMORY_CATEGORY_MAX,
	MEMORY_CATEGORY_MIN,
	MEMORY_CONTENT_MAX_LENGTH,
	MEMORY_IMPORTANCE_MAX,
	MEMORY_IMPORTANCE_MIN,
} from "../customer-memory";
import { registerCustomerMemory } from "./register-customer-memory";

const schema = v.object({
	category: v.pipe(
		v.number(),
		v.minValue(MEMORY_CATEGORY_MIN),
		v.maxValue(MEMORY_CATEGORY_MAX),
	),
	content: v.pipe(
		v.string(),
		v.minLength(1),
		v.maxLength(MEMORY_CONTENT_MAX_LENGTH),
	),
	customerId: v.pipe(v.string(), v.uuid()),
	importance: v.pipe(
		v.number(),
		v.minValue(MEMORY_IMPORTANCE_MIN),
		v.maxValue(MEMORY_IMPORTANCE_MAX),
	),
});

export const registerCustomerMemoryAction = createServerAction(
	registerCustomerMemory,
	{
		name: "registerCustomerMemoryAction",
		onSuccess: ({ input }) => {
			updateTag(CustomerTag.MemoryCrud(input.customerId));
		},
		schema,
	},
);
