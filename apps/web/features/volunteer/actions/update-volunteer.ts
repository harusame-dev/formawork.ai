import { fail, type Result, succeed } from "@harusame0616/result";
import { db } from "@workspace/db/client";
import { volunteersTable } from "@workspace/db/schema/volunteers";
import { eq } from "drizzle-orm";
import type { UpdateVolunteerParams } from "./schema";

const DUPLICATE_CODE_ERROR =
	"このIDは既に使用されています。別のIDを入力してください" as const;
const UPDATE_ERROR = "ボランティアの更新に失敗しました" as const;

type UpdateVolunteerError = typeof DUPLICATE_CODE_ERROR | typeof UPDATE_ERROR;

export async function updateVolunteer(
	params: UpdateVolunteerParams,
): Promise<Result<{ volunteerId: string }, UpdateVolunteerError>> {
	try {
		const rows = await db
			.update(volunteersTable)
			.set({
				code: params.code,
				gender: params.gender ?? null,
				name: params.name,
				participationDates: params.participationDates,
			})
			.where(eq(volunteersTable.volunteerId, params.volunteerId))
			.returning({ volunteerId: volunteersTable.volunteerId });

		const row = rows[0];
		if (!row) {
			return fail(UPDATE_ERROR);
		}

		return succeed({ volunteerId: row.volunteerId });
	} catch (error) {
		if (
			error instanceof Error &&
			error.message.includes("uq_volunteers_event_id_code")
		) {
			return fail(DUPLICATE_CODE_ERROR);
		}
		throw error;
	}
}
