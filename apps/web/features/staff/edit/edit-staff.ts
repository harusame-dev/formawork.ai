import { fail, type Result, succeed } from "@harusame0616/result";
import { getLogger } from "@repo/logger/nextjs/server";
import { createAdminClient } from "@repo/supabase/admin";
import { db } from "@workspace/db/client";
import { staffsTable } from "@workspace/db/schema/staff";
import { eq } from "drizzle-orm";
import type { EditStaffParams } from "./schema";

const STAFF_NOT_FOUND_ERROR_MESSAGE =
	"指定されたスタッフが見つかりません" as const;
const UPDATE_AUTH_ERROR_MESSAGE = "認証ユーザーの更新に失敗しました" as const;

type ErrorMessage =
	| typeof STAFF_NOT_FOUND_ERROR_MESSAGE
	| typeof UPDATE_AUTH_ERROR_MESSAGE;

export async function editStaff(
	params: EditStaffParams & {
		staffId: string;
		authUserId: string;
		originalRole: string;
	},
): Promise<Result<undefined, ErrorMessage>> {
	const logger = await getLogger("editStaff");
	const {
		authUserId,
		email,
		firstName,
		lastName,
		originalRole,
		role,
		staffId,
	} = params;

	const staff = await db.query.staffsTable.findFirst({
		where: eq(staffsTable.staffId, staffId),
	});

	if (!staff) {
		logger.warn("スタッフが見つかりません", {
			staffId,
		});
		return fail(STAFF_NOT_FOUND_ERROR_MESSAGE);
	}

	const supabase = createAdminClient();

	// ロールが変更された場合のみ更新
	if (originalRole !== role) {
		const { error: updateError } = await supabase.auth.admin.updateUserById(
			authUserId,
			{
				app_metadata: {
					role,
					staffId,
				},
			},
		);

		if (updateError) {
			logger.error("認証ユーザーの更新に失敗", {
				authUserId,
				error: updateError.message,
			});
			return fail(UPDATE_AUTH_ERROR_MESSAGE);
		}
	}

	await db
		.update(staffsTable)
		.set({
			firstName,
			lastName,
		})
		.where(eq(staffsTable.staffId, staffId));

	// メールアドレスは Supabase Auth で更新
	if (email !== staff.authUserId) {
		const { error: emailError } = await supabase.auth.admin.updateUserById(
			authUserId,
			{
				email,
			},
		);

		if (emailError) {
			logger.error("メールアドレスの更新に失敗", {
				authUserId,
				error: emailError.message,
			});
			return fail(UPDATE_AUTH_ERROR_MESSAGE);
		}
	}

	logger.info("スタッフ情報の更新に成功", {
		action: "edit-staff",
		staffId,
	});

	return succeed();
}
