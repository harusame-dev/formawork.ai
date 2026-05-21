import { type Result, succeed, tryCatchAsync } from "@harusame0616/result";
import { db } from "@workspace/db/client";
import { staffsTable } from "@workspace/db/schema/staff";
import { v7 as uuidv7 } from "uuid";
import { getAuthAdmin } from "@/features/auth/auth-admin";
import { AuthError } from "@/features/auth/auth-error";
import type { RegisterStaffParams as RegisterStaffParameters } from "./schema";

const EMAIL_EXISTS_ERROR = "このメールアドレスは既に登録されています" as const;
const CREATE_AUTH_ERROR = "認証ユーザーの登録に失敗しました" as const;

type ErrorMessage = typeof EMAIL_EXISTS_ERROR | typeof CREATE_AUTH_ERROR;

export async function registerStaff({
  email,
  firstName,
  lastName,
  password,
  role,
}: RegisterStaffParameters): Promise<
  Result<{ staffId: string }, ErrorMessage>
> {
  const authAdmin = getAuthAdmin();
  const staffId = uuidv7();
  const authUserId = uuidv7();

  return tryCatchAsync(() =>
    db.transaction(async (tx) => {
      await tx
        .insert(staffsTable)
        .values({ authUserId, firstName, lastName, staffId });

      const result = await authAdmin.createUser({
        appMetadata: { role, staffId },
        email,
        id: authUserId,
        password,
      });

      if (!result.success) {
        if (result.error === AuthError.EmailExists) {
          throw EMAIL_EXISTS_ERROR;
        }
        throw CREATE_AUTH_ERROR;
      }

      return succeed({ staffId });
    }),
  );
}
