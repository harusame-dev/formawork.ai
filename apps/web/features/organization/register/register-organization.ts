import { type Result, succeed, tryCatchAsync } from "@harusame0616/result";
import { db } from "@workspace/db/client";
import { organizationsTable } from "@workspace/db/schema/organization";
import { v7 as uuidv7 } from "uuid";
import type { RegisterOrganizationParams } from "./schema";

const REGISTER_FAILED = "組織の登録に失敗しました" as const;

type ErrorMessage = typeof REGISTER_FAILED;

export async function registerOrganization(
	params: RegisterOrganizationParams,
): Promise<Result<{ organizationId: string }, ErrorMessage>> {
	const organizationId = uuidv7();

	return tryCatchAsync(
		async () => {
			await db.insert(organizationsTable).values({
				categoryId: params.categoryId,
				description: params.description,
				email: params.email,
				name: params.name,
				organizationId,
				url: params.url,
			});

			return succeed({ organizationId });
		},
		() => REGISTER_FAILED,
	);
}
