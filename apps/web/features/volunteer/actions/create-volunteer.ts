import { fail, type Result, succeed } from "@harusame0616/result";
import { db } from "@workspace/db/client";
import { volunteersTable } from "@workspace/db/schema/volunteers";
import type { CreateVolunteerParams } from "./schema";

const DUPLICATE_CODE_ERROR =
	"このIDは既に使用されています。別のIDを入力してください" as const;
const CREATE_ERROR = "ボランティアの登録に失敗しました" as const;

type CreateVolunteerError = typeof DUPLICATE_CODE_ERROR | typeof CREATE_ERROR;

export async function createVolunteer(
	params: CreateVolunteerParams,
): Promise<Result<{ volunteerId: string }, CreateVolunteerError>> {
	try {
		const rows = await db
			.insert(volunteersTable)
			.values({
				code: params.code,
				eventId: params.eventId,
				gender: params.gender ?? null,
				name: params.name,
				participationDates: params.participationDates,
			})
			.returning({ volunteerId: volunteersTable.volunteerId });

		const row = rows[0];
		if (!row) {
			return fail(CREATE_ERROR);
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
