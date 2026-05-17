import { type Result, succeed, tryCatchAsync } from "@harusame0616/result";
import { createAdminClient } from "@repo/supabase/admin";
import { db } from "@workspace/db/client";
import { chatsTable } from "@workspace/db/schema/chat";
import { consultationsTable } from "@workspace/db/schema/consultation";
import { organizationsTable } from "@workspace/db/schema/organization";
import { usersTable } from "@workspace/db/schema/user";
import { eq } from "drizzle-orm";

const DELETE_FAILED = "組織の削除に失敗しました" as const;

// 100 年。Supabase の ban_duration は ISO duration ではなく Go の time.Duration 形式
const PERMANENT_BAN_DURATION = "876000h" as const;

type ErrorMessage = typeof DELETE_FAILED;

export async function deleteOrganization({
	organizationId,
}: {
	organizationId: string;
}): Promise<Result<void, ErrorMessage>> {
	return tryCatchAsync(
		async () => {
			const targetUsers = await db
				.select({ authUserId: usersTable.authUserId })
				.from(usersTable)
				.where(eq(usersTable.organizationId, organizationId));

			await db.transaction(async (tx) => {
				await tx
					.update(chatsTable)
					.set({ referrerOrgId: null })
					.where(eq(chatsTable.referrerOrgId, organizationId));

				await tx
					.update(consultationsTable)
					.set({ targetOrgId: null })
					.where(eq(consultationsTable.targetOrgId, organizationId));

				await tx
					.update(usersTable)
					.set({ organizationId: null })
					.where(eq(usersTable.organizationId, organizationId));

				await tx
					.delete(organizationsTable)
					.where(eq(organizationsTable.organizationId, organizationId));
			});

			const authUserIds = targetUsers
				.map((u) => u.authUserId)
				.filter((id): id is string => !!id);
			if (authUserIds.length > 0) {
				const supabase = createAdminClient();
				await Promise.all(
					authUserIds.map((authUserId) =>
						supabase.auth.admin.updateUserById(authUserId, {
							ban_duration: PERMANENT_BAN_DURATION,
						}),
					),
				);
			}

			return succeed();
		},
		() => DELETE_FAILED,
	);
}
