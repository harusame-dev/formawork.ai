import { fail, type Result, succeed } from "@harusame0616/result";
import { createAdminClient } from "@repo/supabase/admin";
import { db } from "@workspace/db/client";
import { staffsTable } from "@workspace/db/schema/staff";
import { eq } from "drizzle-orm";

const USER_NOT_FOUND_ERROR_MESSAGE =
	"指定されたユーザーが見つかりません" as const;
const CANNOT_DELETE_SELF_ERROR_MESSAGE = "自分自身は削除できません" as const;

type DeleteUserErrorMessage =
	| typeof USER_NOT_FOUND_ERROR_MESSAGE
	| typeof CANNOT_DELETE_SELF_ERROR_MESSAGE;

type DeleteUserInput = {
	currentUserId: string;
	userId: string;
};

export async function deleteUser({
	currentUserId,
	userId,
}: DeleteUserInput): Promise<Result<undefined, DeleteUserErrorMessage>> {
	if (userId === currentUserId) {
		return fail(CANNOT_DELETE_SELF_ERROR_MESSAGE);
	}

	const [user] = await db
		.select({
			authUserId: staffsTable.authUserId,
			staffId: staffsTable.staffId,
		})
		.from(staffsTable)
		.where(eq(staffsTable.staffId, userId))
		.limit(1);

	if (!user) {
		return fail(USER_NOT_FOUND_ERROR_MESSAGE);
	}

	const supabase = createAdminClient();

	await db.transaction(async (tx) => {
		await tx.delete(staffsTable).where(eq(staffsTable.staffId, userId));

		if (!user.authUserId) {
			return;
		}

		const { error: deleteError } = await supabase.auth.admin.deleteUser(
			user.authUserId,
		);

		if (deleteError) {
			throw deleteError;
		}
	});

	return succeed();
}
