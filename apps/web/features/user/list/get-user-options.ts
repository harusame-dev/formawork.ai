import { db } from "@workspace/db/client";
import { staffsTable } from "@workspace/db/schema/staff";
import { asc, sql } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { UserTag } from "../tag";

export type UserOption = {
	fullName: string;
	userId: string;
};

export async function getUserOptions(): Promise<UserOption[]> {
	"use cache";
	cacheLife("permanent");
	cacheTag(UserTag.List);

	const users = await db
		.select({
			fullName: sql<string>`${staffsTable.lastName} || ${staffsTable.firstName}`,
			userId: staffsTable.staffId,
		})
		.from(staffsTable)
		.orderBy(asc(staffsTable.lastName), asc(staffsTable.firstName));

	return users;
}
