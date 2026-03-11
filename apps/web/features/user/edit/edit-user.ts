import { fail, type Result, succeed } from "@harusame0616/result";
import { getLogger } from "@repo/logger/nextjs/server";
import { createAdminClient } from "@repo/supabase/admin";
import { db } from "@workspace/db/client";
import { staffsTable } from "@workspace/db/schema/staff";
import { eq } from "drizzle-orm";
import { authUsers } from "drizzle-orm/supabase";
import type { EditUserParams } from "./schema";

const USER_NOT_FOUND_ERROR_MESSAGE =
	"指定されたユーザーが見つかりません" as const;
const UPDATE_AUTH_ERROR_MESSAGE = "ロールの更新に失敗しました。" as const;

type ErrorMessage =
	| typeof USER_NOT_FOUND_ERROR_MESSAGE
	| typeof UPDATE_AUTH_ERROR_MESSAGE;

export async function editUser(
	params: EditUserParams & {
		userId: string;
		authUserId: string;
		originalRole: string;
	},
): Promise<Result<undefined, ErrorMessage>> {
	const logger = await getLogger("editUser");
	const { authUserId, email, firstName, lastName, originalRole, role, userId } =
		params;

	try {
		await db.transaction(async (tx) => {
			// DB更新（returning で存在確認）
			const [updatedUser] = await tx
				.update(staffsTable)
				.set({
					firstName,
					lastName,
				})
				.where(eq(staffsTable.staffId, userId))
				.returning({ staffId: staffsTable.staffId });

			if (!updatedUser) {
				logger.warn("ユーザーが見つかりません", {
					userId,
				});
				throw new Error(USER_NOT_FOUND_ERROR_MESSAGE);
			}

			await tx
				.update(authUsers)
				.set({ email })
				.where(eq(authUsers.id, authUserId));
		});
		if (originalRole !== role) {
			const supabase = createAdminClient();
			const { error: updateError } = await supabase.auth.admin.updateUserById(
				authUserId,
				{
					app_metadata: {
						role,
						staffId: userId,
					},
				},
			);

			if (updateError) {
				logger.error("ロールの更新に失敗", {
					authUserId,
					error: updateError.message,
				});
				throw new Error(UPDATE_AUTH_ERROR_MESSAGE);
			}
		}
	} catch (error) {
		if (error instanceof Error) {
			if (error.message === USER_NOT_FOUND_ERROR_MESSAGE) {
				return fail(USER_NOT_FOUND_ERROR_MESSAGE);
			}
			if (error.message === UPDATE_AUTH_ERROR_MESSAGE) {
				return fail(UPDATE_AUTH_ERROR_MESSAGE);
			}
		}
		throw error;
	}

	logger.info("ユーザー情報の更新に成功", {
		action: "edit-user",
		userId,
	});

	return succeed();
}
