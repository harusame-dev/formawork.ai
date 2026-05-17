import {
	fail,
	type Result,
	succeed,
	tryCatchAsync,
} from "@harusame0616/result";
import { createAdminClient } from "@repo/supabase/admin";
import { db } from "@workspace/db/client";
import { usersTable } from "@workspace/db/schema/user";
import { eq } from "drizzle-orm";

const NOT_FOUND = "ユーザーが見つかりません" as const;
const DELETE_FAILED = "ユーザーの削除に失敗しました" as const;

type ErrorMessage = typeof NOT_FOUND | typeof DELETE_FAILED;

export async function deleteUser({
	userId,
}: {
	userId: string;
}): Promise<Result<void, ErrorMessage>> {
	const existing = await db
		.select({ authUserId: usersTable.authUserId })
		.from(usersTable)
		.where(eq(usersTable.userId, userId))
		.limit(1);

	const target = existing[0];
	if (!target) {
		return fail(NOT_FOUND);
	}

	const supabase = createAdminClient();

	return tryCatchAsync(
		async () => {
			await db.delete(usersTable).where(eq(usersTable.userId, userId));

			if (target.authUserId) {
				await supabase.auth.admin.deleteUser(target.authUserId);
			}

			return succeed();
		},
		() => DELETE_FAILED,
	);
}
