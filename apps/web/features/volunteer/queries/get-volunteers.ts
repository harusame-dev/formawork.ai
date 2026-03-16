import { db } from "@workspace/db/client";
import type { SelectVolunteer } from "@workspace/db/schema/volunteers";
import { volunteersTable } from "@workspace/db/schema/volunteers";
import { asc, eq } from "drizzle-orm";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import { VolunteerTag } from "../tag";

export async function getVolunteers(
	eventId: string,
): Promise<SelectVolunteer[]> {
	"use cache: private";
	cacheTag(VolunteerTag.List(eventId));

	return db
		.select()
		.from(volunteersTable)
		.where(eq(volunteersTable.eventId, eventId))
		.orderBy(asc(volunteersTable.code));
}
