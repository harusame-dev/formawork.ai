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
import { generatePassword } from "@/libs/generate-password";

const NOT_FOUND = "ユーザーが見つかりません" as const;
const RESET_FAILED = "パスワードのリセットに失敗しました" as const;

type ErrorMessage = typeof NOT_FOUND | typeof RESET_FAILED;

export async function resetPassword({
	userId,
}: {
	userId: string;
}): Promise<Result<{ password: string }, ErrorMessage>> {
	const existing = await db
		.select({ authUserId: usersTable.authUserId })
		.from(usersTable)
		.where(eq(usersTable.userId, userId))
		.limit(1);

	const target = existing[0];
	if (!target?.authUserId) {
		return fail(NOT_FOUND);
	}

	const authUserId = target.authUserId;
	const password = generatePassword();
	const supabase = createAdminClient();

	return tryCatchAsync(
		async () => {
			const { error } = await supabase.auth.admin.updateUserById(authUserId, {
				password,
			});
			if (error) {
				throw RESET_FAILED;
			}
			return succeed({ password });
		},
		() => RESET_FAILED,
	);
}
