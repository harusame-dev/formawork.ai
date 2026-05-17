import {
	fail,
	type Result,
	succeed,
	tryCatchAsync,
} from "@harusame0616/result";
import { db } from "@workspace/db/client";
import { organizationsTable } from "@workspace/db/schema/organization";
import { eq } from "drizzle-orm";
import type { UpdateOrganizationEmailParams } from "./schema";

const UPDATE_FAILED = "相談用メールアドレスの更新に失敗しました" as const;
const NOT_FOUND = "組織が見つかりません" as const;

type ErrorMessage = typeof UPDATE_FAILED | typeof NOT_FOUND;

export async function updateOrganizationEmail(
	params: UpdateOrganizationEmailParams,
): Promise<Result<void, ErrorMessage>> {
	const existing = await db
		.select({ organizationId: organizationsTable.organizationId })
		.from(organizationsTable)
		.where(eq(organizationsTable.organizationId, params.organizationId))
		.limit(1);

	if (existing.length === 0) {
		return fail(NOT_FOUND);
	}

	return tryCatchAsync(
		async () => {
			await db
				.update(organizationsTable)
				.set({ email: params.email })
				.where(eq(organizationsTable.organizationId, params.organizationId));

			return succeed();
		},
		() => UPDATE_FAILED,
	);
}
