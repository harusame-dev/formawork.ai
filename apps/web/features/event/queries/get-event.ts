import { db } from "@workspace/db/client";
import type { SelectEvent } from "@workspace/db/schema/events";
import { eventsTable } from "@workspace/db/schema/events";
import { eq } from "drizzle-orm";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import { EVENT_TAG } from "../tag";

export async function getEvent(eventId: string): Promise<SelectEvent | null> {
	"use cache: private";
	cacheTag(EVENT_TAG);

	const rows = await db
		.select()
		.from(eventsTable)
		.where(eq(eventsTable.eventId, eventId))
		.limit(1);

	return rows[0] ?? null;
}
