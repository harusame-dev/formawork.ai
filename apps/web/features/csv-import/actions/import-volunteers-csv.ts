import { fail, succeed } from "@harusame0616/result";
import { db } from "@workspace/db/client";
import { eventsTable } from "@workspace/db/schema/events";
import { volunteersTable } from "@workspace/db/schema/volunteers";
import { and, eq, inArray } from "drizzle-orm";
import { serializeCsvErrors } from "../lib/csv-errors";
import type { CsvParseError } from "../lib/parse-csv";
import { parseCsv } from "../lib/parse-csv";

type ImportVolunteersCsvInput = {
	csvContent: string;
	eventId: string;
};

type ImportVolunteersCsvSuccess = {
	count: number;
};

export async function importVolunteersCsv({
	csvContent,
	eventId,
}: ImportVolunteersCsvInput) {
	// Fetch event to get event dates
	const event = await db
		.select()
		.from(eventsTable)
		.where(eq(eventsTable.eventId, eventId))
		.then((rows) => rows[0]);

	if (!event) {
		return fail("イベントが見つかりません" as const);
	}

	const eventDates = event.eventDates;

	// Parse and validate CSV
	const parseResult = parseCsv(csvContent, eventDates);

	if (!parseResult.success) {
		return fail(serializeCsvErrors(parseResult.errors));
	}

	const rows = parseResult.rows;
	const codes = rows.map((r) => r.code);

	// Check for existing codes in DB for this event
	const existingVolunteers = await db
		.select({ code: volunteersTable.code })
		.from(volunteersTable)
		.where(
			and(
				eq(volunteersTable.eventId, eventId),
				inArray(volunteersTable.code, codes),
			),
		);

	if (existingVolunteers.length > 0) {
		const duplicateCodes = existingVolunteers.map((v) => v.code);
		const dbErrors: CsvParseError[] = duplicateCodes.map((code) => ({
			message: `ID「${code}」はこのイベントに既に登録されています`,
			row: null,
		}));
		return fail(serializeCsvErrors(dbErrors));
	}

	// Insert all volunteers in a transaction
	await db.transaction(async (tx) => {
		for (const row of rows) {
			await tx.insert(volunteersTable).values({
				code: row.code,
				eventId,
				gender: row.gender !== "" ? row.gender : null,
				name: row.name,
				participationDates: row.participationDates,
			});
		}
	});

	return succeed<ImportVolunteersCsvSuccess>({ count: rows.length });
}
