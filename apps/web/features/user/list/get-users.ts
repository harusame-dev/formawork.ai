import { db } from "@workspace/db/client";
import { staffsTable } from "@workspace/db/schema/staff";
import { asc, eq, or, sql } from "drizzle-orm";
import { authUsers } from "drizzle-orm/supabase";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import { UserTag } from "../tag";
import type { UsersCondition } from "./schema";

type User = {
	email: string;
	firstName: string;
	lastName: string;
	userId: string;
};

type GetUsersResult = {
	users: User[];
	page: number;
	totalPages: number;
};

export async function getUsers({
	keyword,
	page,
}: UsersCondition): Promise<GetUsersResult> {
	"use cache: private";
	cacheTag(UserTag.List);

	const pageSize = 20;
	const whereConditions = keyword
		? or(eq(staffsTable.firstName, keyword), eq(staffsTable.lastName, keyword))
		: undefined;

	const users = await db
		.select({
			email: sql<string>`COALESCE(${authUsers.email}, '')`,
			firstName: staffsTable.firstName,
			lastName: staffsTable.lastName,
			userId: staffsTable.staffId,
		})
		.from(staffsTable)
		.leftJoin(authUsers, eq(staffsTable.authUserId, authUsers.id))
		.where(whereConditions)
		.orderBy(asc(staffsTable.lastName), asc(staffsTable.firstName))
		.limit(pageSize)
		.offset((page - 1) * pageSize);

	const total = await db
		.select({ count: sql<number>`count(*)` })
		.from(staffsTable)
		.leftJoin(authUsers, eq(staffsTable.authUserId, authUsers.id))
		.where(whereConditions)
		.then((result) => Number(result[0]?.count ?? 0));

	return {
		page,
		totalPages: Math.ceil(total / pageSize),
		users,
	};
}
