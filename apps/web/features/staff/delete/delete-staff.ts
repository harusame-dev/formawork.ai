import { fail, type Result, succeed } from "@harusame0616/result";
import { db } from "@workspace/db/client";
import { staffsTable } from "@workspace/db/schema/staff";
import { eq } from "drizzle-orm";
import { getAuthAdmin } from "@/features/auth/auth-admin";

const STAFF_NOT_FOUND_ERROR_MESSAGE =
  "指定されたスタッフが見つかりません" as const;
const CANNOT_DELETE_SELF_ERROR_MESSAGE = "自分自身は削除できません" as const;

type DeleteStaffErrorMessage =
  | typeof STAFF_NOT_FOUND_ERROR_MESSAGE
  | typeof CANNOT_DELETE_SELF_ERROR_MESSAGE;

interface DeleteStaffInput {
  currentUserStaffId: string;
  staffId: string;
}

export async function deleteStaff({
  currentUserStaffId,
  staffId,
}: DeleteStaffInput): Promise<Result<undefined, DeleteStaffErrorMessage>> {
  if (staffId === currentUserStaffId) {
    return fail(CANNOT_DELETE_SELF_ERROR_MESSAGE);
  }

  const [staff] = await db
    .select({
      authUserId: staffsTable.authUserId,
      staffId: staffsTable.staffId,
    })
    .from(staffsTable)
    .where(eq(staffsTable.staffId, staffId))
    .limit(1);

  if (!staff) {
    return fail(STAFF_NOT_FOUND_ERROR_MESSAGE);
  }

  const authAdmin = getAuthAdmin();

  await db.transaction(async (tx) => {
    await tx.delete(staffsTable).where(eq(staffsTable.staffId, staffId));

    if (!staff.authUserId) {
      return;
    }

    const deleteResult = await authAdmin.deleteUser(staff.authUserId);

    if (!deleteResult.success) {
      throw new Error(
        `認証ユーザーの削除に失敗しました: ${deleteResult.error}`,
      );
    }
  });

  return succeed();
}
