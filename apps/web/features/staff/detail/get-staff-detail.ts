import { db } from "@workspace/db/client";
import { staffsTable } from "@workspace/db/schema/staff";
import { eq, sql } from "drizzle-orm";
import { authUsers } from "drizzle-orm/supabase";
import { cacheLife, cacheTag } from "next/cache";
import { cache } from "react";
import { UserRole } from "../../auth/user/role";
import { StaffTag } from "../tag";

export const getStaffDetail = cache(async (staffId: string) => {
	"use cache";
	cacheLife("permanent");
	cacheTag(StaffTag.Detail(staffId));

	const staffs = await db
		.select({
			authUserId: staffsTable.authUserId,
			createdAt: staffsTable.createdAt,
			email: sql<string>`COALESCE(${authUsers.email}, '')`,
			firstName: staffsTable.firstName,
			lastName: staffsTable.lastName,
			role: sql<string>`COALESCE("auth"."users".raw_app_meta_data->>'role', ${UserRole.Admin})`,
			staffId: staffsTable.staffId,
			updatedAt: staffsTable.updatedAt,
		})
		.from(staffsTable)
		.leftJoin(authUsers, eq(authUsers.id, staffsTable.authUserId))
		.where(eq(staffsTable.staffId, staffId))
		.limit(1);
	console.log(staffs);

	return staffs[0] ?? null;
});
