import { fail, type Result, succeed } from "@harusame0616/result";
import { db } from "@workspace/db/client";
import { chatsTable } from "@workspace/db/schema/chat";
import { organizationsTable } from "@workspace/db/schema/organization";
import { eq } from "drizzle-orm";
import { v7 as uuidv7 } from "uuid";

const ORG_NOT_FOUND = "組織が見つかりません" as const;

type ErrorMessage = typeof ORG_NOT_FOUND;

export async function startChat({
	organizationId,
}: {
	organizationId: string;
}): Promise<Result<{ chatId: string }, ErrorMessage>> {
	const org = await db
		.select({ organizationId: organizationsTable.organizationId })
		.from(organizationsTable)
		.where(eq(organizationsTable.organizationId, organizationId))
		.limit(1);

	if (org.length === 0) {
		return fail(ORG_NOT_FOUND);
	}

	const chatId = uuidv7();

	await db.insert(chatsTable).values({
		chatId,
		referrerOrgId: organizationId,
	});

	return succeed({ chatId });
}
