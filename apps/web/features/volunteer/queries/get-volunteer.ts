import { db } from "@workspace/db/client";
import type { SelectVolunteer } from "@workspace/db/schema/volunteers";
import { volunteersTable } from "@workspace/db/schema/volunteers";
import { eq } from "drizzle-orm";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import { VolunteerTag } from "../tag";

export async function getVolunteer(
	volunteerId: string,
): Promise<SelectVolunteer | null> {
	"use cache: private";
	cacheTag(VolunteerTag.Detail(volunteerId));

	const rows = await db
		.select()
		.from(volunteersTable)
		.where(eq(volunteersTable.volunteerId, volunteerId))
		.limit(1);

	return rows[0] ?? null;
}
