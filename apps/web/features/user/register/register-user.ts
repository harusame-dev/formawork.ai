import { type Result, succeed, tryCatchAsync } from "@harusame0616/result";
import { createAdminClient } from "@repo/supabase/admin";
import { db } from "@workspace/db/client";
import { staffsTable } from "@workspace/db/schema/staff";
import { v7 as uuidv7 } from "uuid";
import type { RegisterUserParams } from "./schema";

const EMAIL_EXISTS_ERROR = "このメールアドレスは既に登録されています" as const;
const CREATE_AUTH_ERROR = "認証ユーザーの登録に失敗しました" as const;

type ErrorMessage = typeof EMAIL_EXISTS_ERROR | typeof CREATE_AUTH_ERROR;

export async function registerUser({
	email,
	firstName,
	lastName,
	password,
	role,
}: RegisterUserParams): Promise<Result<{ userId: string }, ErrorMessage>> {
	const supabase = createAdminClient();
	const userId = uuidv7();
	const authUserId = uuidv7();

	return tryCatchAsync(() =>
		db.transaction(async (tx) => {
			await tx
				.insert(staffsTable)
				.values({ authUserId, firstName, lastName, staffId: userId });

			const { error } = await supabase.auth.admin.createUser({
				app_metadata: { role, staffId: userId },
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

			return succeed({ userId });
		}),
	);
}
