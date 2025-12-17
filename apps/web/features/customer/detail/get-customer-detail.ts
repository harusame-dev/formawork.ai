import { db } from "@workspace/db/client";
import { customersTable } from "@workspace/db/schema/customer";
import { eq } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { cache } from "react";
import * as v from "valibot";
import { genderSchema } from "../schema";
import { CustomerTag } from "../tag";

export const getCustomerDetail = cache(async (customerId: string) => {
	"use cache";
	cacheLife("permanent");
	cacheTag(CustomerTag.Detail(customerId));

	const customers = await db
		.select()
		.from(customersTable)
		.where(eq(customersTable.customerId, customerId))
		.limit(1);

	return customers[0]
		? {
				...customers[0],
				gender: v.parse(genderSchema, customers[0].gender),
			}
		: null;
});
