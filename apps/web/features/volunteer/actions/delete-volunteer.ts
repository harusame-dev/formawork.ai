import { fail, type Result, succeed } from "@harusame0616/result";
import { db } from "@workspace/db/client";
import { volunteersTable } from "@workspace/db/schema/volunteers";
import { eq } from "drizzle-orm";

const DELETE_ERROR = "ボランティアの削除に失敗しました" as const;

type DeleteVolunteerError = typeof DELETE_ERROR;

export async function deleteVolunteer(params: {
	volunteerId: string;
}): Promise<Result<{ volunteerId: string }, DeleteVolunteerError>> {
	const rows = await db
		.delete(volunteersTable)
		.where(eq(volunteersTable.volunteerId, params.volunteerId))
		.returning({ volunteerId: volunteersTable.volunteerId });

	const row = rows[0];
	if (!row) {
		return fail(DELETE_ERROR);
	}

	return succeed({ volunteerId: row.volunteerId });
}
