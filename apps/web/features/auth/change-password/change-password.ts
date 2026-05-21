import { fail, type Result, succeed } from "@harusame0616/result";
import { AuthError, getAuth } from "@/features/auth/auth";

const SessionError = "セッションが無効です。再度ログインしてください" as const;
const CurrentPasswordError = "現在のパスワードが正しくありません" as const;
const UpdateError = "パスワードの更新に失敗しました" as const;

type ChangePasswordError =
  | typeof SessionError
  | typeof CurrentPasswordError
  | typeof UpdateError;

export async function changePassword({
  currentPassword,
  newPassword,
}: {
  currentPassword: string;
  newPassword: string;
}): Promise<Result<void, ChangePasswordError>> {
  const auth = await getAuth();

  const verifyResult = await auth.verifyCurrentPassword(currentPassword);
  if (!verifyResult.success) {
    if (verifyResult.error === AuthError.SessionExpired) {
      return fail(SessionError);
    }
    return fail(CurrentPasswordError);
  }

  const updateResult = await auth.updatePassword(newPassword);
  if (!updateResult.success) {
    return fail(UpdateError);
  }

  return succeed();
}
