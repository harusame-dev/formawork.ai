import { fail, type Result, succeed } from "@harusame0616/result";
import { db } from "@workspace/db/client";
import { eventsTable } from "@workspace/db/schema/events";
import { revalidateTag } from "next/cache";
import { EVENT_TAG } from "../tag";
import type { EventFormParams } from "./schema";

const CreateEventError = "イベントの作成に失敗しました" as const;

export async function createEvent(
	params: EventFormParams,
): Promise<Result<{ eventId: string }, typeof CreateEventError>> {
	const uniqueDates = [...new Set(params.eventDates)].sort();

	const rows = await db
		.insert(eventsTable)
		.values({
			description: params.description || null,
			eventDates: uniqueDates,
			name: params.name,
		})
		.returning({ eventId: eventsTable.eventId });

	const row = rows[0];
	if (!row) {
		return fail(CreateEventError);
	}

	revalidateTag(EVENT_TAG, "max");

	return succeed({ eventId: row.eventId });
}
