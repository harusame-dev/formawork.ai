import { db } from "@workspace/db/client";
import { organizationsTable } from "@workspace/db/schema/organization";
import { usersTable } from "@workspace/db/schema/user";
import { asc, eq, isNotNull, sql } from "drizzle-orm";
import { authUsers } from "drizzle-orm/supabase";
import { cacheLife, cacheTag } from "next/cache";
import { UserTag } from "../tag";

// auth.users.raw_app_meta_data は drizzle-orm/supabase ヘルパに含まれないため
// SQL で直接参照する
const authUsersRawAppMetaData = sql`auth.users.raw_app_meta_data`;

export type User = {
	email: string;
	organizationId: string;
	organizationName: string;
	role: string;
	userId: string;
};

type GetUsersResult = {
	page: number;
	totalPages: number;
	users: User[];
};

type GetUsersCondition = {
	page: number;
};

export async function getUsers({
	page,
}: GetUsersCondition): Promise<GetUsersResult> {
	"use cache";
	cacheLife("permanent");
	cacheTag(UserTag.List);

	const pageSize = 20;

	const users = await db
		.select({
			email: sql<string>`COALESCE(${authUsers.email}, '')`,
			organizationId: sql<string>`${usersTable.organizationId}`,
			organizationName: organizationsTable.name,
			role: sql<string>`COALESCE(${authUsersRawAppMetaData} ->> 'role', '')`,
			userId: usersTable.userId,
		})
		.from(usersTable)
		.leftJoin(authUsers, eq(usersTable.authUserId, authUsers.id))
		.innerJoin(
			organizationsTable,
			eq(usersTable.organizationId, organizationsTable.organizationId),
		)
		.orderBy(asc(organizationsTable.name), asc(usersTable.createdAt))
		.limit(pageSize)
		.offset((page - 1) * pageSize);

	const total = await db
		.select({ count: sql<number>`count(*)` })
		.from(usersTable)
		.where(isNotNull(usersTable.organizationId))
		.then((result) => Number(result[0]?.count ?? 0));

	return {
		page,
		totalPages: Math.max(1, Math.ceil(total / pageSize)),
		users,
	};
}
