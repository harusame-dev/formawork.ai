import { type Result, succeed, tryCatchAsync } from "@harusame0616/result";
import { createAdminClient } from "@repo/supabase/admin";
import { db } from "@workspace/db/client";
import { usersTable } from "@workspace/db/schema/user";
import { v7 as uuidv7 } from "uuid";
import { generatePassword } from "@/libs/generate-password";
import type { RegisterUserParams } from "./schema";

const EMAIL_EXISTS_ERROR = "このメールアドレスは既に登録されています" as const;
const CREATE_AUTH_ERROR = "認証ユーザーの作成に失敗しました" as const;
const CREATE_USER_ERROR = "ユーザーの登録に失敗しました" as const;

type ErrorMessage =
	| typeof EMAIL_EXISTS_ERROR
	| typeof CREATE_AUTH_ERROR
	| typeof CREATE_USER_ERROR;

export async function registerUser(
	params: RegisterUserParams,
): Promise<
	Result<{ userId: string; email: string; password: string }, ErrorMessage>
> {
	const supabase = createAdminClient();
	const userId = uuidv7();
	const authUserId = uuidv7();
	const password = generatePassword();

	return tryCatchAsync(
		async () => {
			await db.insert(usersTable).values({
				authUserId,
				organizationId: params.organizationId,
				userId,
			});

			const { error } = await supabase.auth.admin.createUser({
				app_metadata: { role: params.role, userId },
				email: params.email,
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

			return succeed({ email: params.email, password, userId });
		},
		(error) => {
			if (error === EMAIL_EXISTS_ERROR || error === CREATE_AUTH_ERROR) {
				return error;
			}
			return CREATE_USER_ERROR;
		},
	);
}
