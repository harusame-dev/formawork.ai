import { fail, type Result, succeed } from "@harusame0616/result";
import { getLogger } from "@repo/logger/nextjs/server";
import { createAdminClient } from "@repo/supabase/admin";
import { db } from "@workspace/db/client";
import { staffsTable } from "@workspace/db/schema/staff";
import { eq } from "drizzle-orm";
import { authUsers } from "drizzle-orm/supabase";
import type { EditStaffParams as EditStaffParameters } from "./schema";

const STAFF_NOT_FOUND_ERROR_MESSAGE =
  "指定されたスタッフが見つかりません" as const;
const UPDATE_AUTH_ERROR_MESSAGE = "ロールの更新に失敗しました。" as const;

type ErrorMessage =
  | typeof STAFF_NOT_FOUND_ERROR_MESSAGE
  | typeof UPDATE_AUTH_ERROR_MESSAGE;

export async function editStaff(
  parameters: EditStaffParameters & {
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
  } = parameters;

  try {
    await db.transaction(async (tx) => {
      // DB更新（returning で存在確認）
      const [updatedStaff] = await tx
        .update(staffsTable)
        .set({
          firstName,
          lastName,
        })
        .where(eq(staffsTable.staffId, staffId))
        .returning({ staffId: staffsTable.staffId });

      if (!updatedStaff) {
        logger.warn("スタッフが見つかりません", {
          staffId,
        });
        throw new Error(STAFF_NOT_FOUND_ERROR_MESSAGE);
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
            staffId,
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
      if (error.message === STAFF_NOT_FOUND_ERROR_MESSAGE) {
        return fail(STAFF_NOT_FOUND_ERROR_MESSAGE);
      }
      if (error.message === UPDATE_AUTH_ERROR_MESSAGE) {
        return fail(UPDATE_AUTH_ERROR_MESSAGE);
      }
    }
    throw error;
  }

  logger.info("スタッフ情報の更新に成功", {
    action: "edit-staff",
    staffId,
  });

  return succeed();
}
