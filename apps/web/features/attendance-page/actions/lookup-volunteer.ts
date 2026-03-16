import { fail, succeed } from "@harusame0616/result";
import { db } from "@workspace/db/client";
import { volunteersTable } from "@workspace/db/schema/volunteers";
import { and, eq } from "drizzle-orm";

type LookupVolunteerInput = {
	code: string;
	eventId: string;
};

type VolunteerInfo = {
	name: string;
	volunteerId: string;
};

export async function lookupVolunteer({ code, eventId }: LookupVolunteerInput) {
	const rows = await db
		.select({
			name: volunteersTable.name,
			volunteerId: volunteersTable.volunteerId,
		})
		.from(volunteersTable)
		.where(
			and(eq(volunteersTable.eventId, eventId), eq(volunteersTable.code, code)),
		)
		.limit(1);

	const volunteer = rows[0];
	if (!volunteer) {
		return fail("IDが見つかりませんでした" as const);
	}

	return succeed<VolunteerInfo>(volunteer);
}
