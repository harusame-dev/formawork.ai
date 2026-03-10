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
import { editCustomerMemory } from "./edit-customer-memory";

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
	memoryId: v.pipe(v.string(), v.uuid()),
});

export const editCustomerMemoryAction = createServerAction(editCustomerMemory, {
	name: "editCustomerMemoryAction",
	onSuccess: ({ input: { customerId } }) => {
		updateTag(CustomerTag.MemoriesByCustomerId(customerId));
	},
	schema,
});
