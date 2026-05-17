import { createClient } from "@repo/supabase/nextjs/server";
import { db } from "@workspace/db/client";
import { usersTable } from "@workspace/db/schema/user";
import { eq } from "drizzle-orm";

// users テーブルの user_id を返す。
// auth.users.id を元に users テーブルを引いて取得する（auth_user_id を経由）
export async function getUserId(): Promise<string | null> {
	const supabase = await createClient();

	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		return null;
	}

	const result = await db
		.select({ userId: usersTable.userId })
		.from(usersTable)
		.where(eq(usersTable.authUserId, user.id))
		.limit(1);

	return result[0]?.userId ?? null;
}
