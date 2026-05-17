import { db } from "@workspace/db/client";
import { organizationsTable } from "@workspace/db/schema/organization";
import { usersTable } from "@workspace/db/schema/user";
import { eq, sql } from "drizzle-orm";
import { authUsers } from "drizzle-orm/supabase";
import { cacheLife, cacheTag } from "next/cache";
import { UserTag } from "../tag";

const authUsersRawAppMetaData = sql`auth.users.raw_app_meta_data`;

export type UserDetail = {
	email: string;
	organizationId: string;
	organizationName: string;
	role: string;
	userId: string;
};

export async function getUserDetail(
	userId: string,
): Promise<UserDetail | null> {
	"use cache";
	cacheLife("permanent");
	cacheTag(UserTag.Detail(userId));

	const result = await db
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
		.where(eq(usersTable.userId, userId))
		.limit(1);

	return result[0] ?? null;
}
