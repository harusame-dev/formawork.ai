import { createClient } from "@repo/supabase/nextjs/server";
import { db } from "@workspace/db/client";
import { usersTable } from "@workspace/db/schema/user";
import { eq } from "drizzle-orm";

// ログイン中のユーザーの所属組織 ID を返す
export async function getUserOrganizationId(): Promise<string | null> {
	const supabase = await createClient();

	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		return null;
	}

	const result = await db
		.select({ organizationId: usersTable.organizationId })
		.from(usersTable)
		.where(eq(usersTable.authUserId, user.id))
		.limit(1);

	return result[0]?.organizationId ?? null;
}
