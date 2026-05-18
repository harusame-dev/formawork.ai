import { type Result, succeed, tryCatchAsync } from "@harusame0616/result";
import { createAdminClient } from "@repo/supabase/admin";
import { db } from "@workspace/db/client";
import { staffsTable } from "@workspace/db/schema/staff";
import { v7 as uuidv7 } from "uuid";
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
  const supabase = createAdminClient();
  const staffId = uuidv7();
  const authUserId = uuidv7();

  return tryCatchAsync(() =>
    db.transaction(async (tx) => {
      await tx
        .insert(staffsTable)
        .values({ authUserId, firstName, lastName, staffId });

      const { error } = await supabase.auth.admin.createUser({
        app_metadata: { role, staffId },
        email,
        email_confirm: true,
        id: authUserId,
        password,
      });

      if (error) {
        if (error.code === "email_exists") {
          throw EMAIL_EXISTS_ERROR;
        }

        throw CREATE_AUTH_ERROR;
      }

      return succeed({ staffId });
    }),
  );
}
