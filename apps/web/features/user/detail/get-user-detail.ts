import { db } from "@workspace/db/client";
import { staffsTable } from "@workspace/db/schema/staff";
import { eq, sql } from "drizzle-orm";
import { authUsers } from "drizzle-orm/supabase";
import { cacheLife, cacheTag } from "next/cache";
import { cache } from "react";
import { UserRole } from "../../auth/user/role";
import { UserTag } from "../tag";

export const getUserDetail = cache(async (userId: string) => {
	"use cache";
	cacheLife("permanent");
	cacheTag(UserTag.Detail(userId));

	const users = await db
		.select({
			authUserId: staffsTable.authUserId,
			createdAt: staffsTable.createdAt,
			email: sql<string>`COALESCE(${authUsers.email}, '')`,
			firstName: staffsTable.firstName,
			lastName: staffsTable.lastName,
			role: sql<string>`COALESCE("auth"."users".raw_app_meta_data->>'role', ${UserRole.Admin})`,
			updatedAt: staffsTable.updatedAt,
			userId: staffsTable.staffId,
		})
		.from(staffsTable)
		.leftJoin(authUsers, eq(authUsers.id, staffsTable.authUserId))
		.where(eq(staffsTable.staffId, userId))
		.limit(1);

	return users[0] ?? null;
});
