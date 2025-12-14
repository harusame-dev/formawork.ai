import { fail, type Result, succeed } from "@harusame0616/result";
import { db } from "@workspace/db/client";
import { schemaName } from "@workspace/db/pgschema";
import {
	type AdviceContent,
	customerNoteAdviceTable,
} from "@workspace/db/schema/customer-note-advice";
import { sql } from "drizzle-orm";
import * as v from "valibot";
import { genderSchema } from "@/features/customer/schema";
import { generateAdviceContent } from "./generate-advice-content";

const RECENT_NOTES_LIMIT = 10;

const SERVICE_NOTE_NOT_FOUND_ERROR = "サービスノートが見つかりません" as const;
type GenerateServiceAdviceError = typeof SERVICE_NOTE_NOT_FOUND_ERROR;

type RecentNote = {
	content: string;
	createdAt: Date;
};

type ServiceNoteData = {
	birthDate: string | null;
	content: string;
	customerId: string;
	firstName: string;
	gender: number;
	id: string;
	lastName: string;
	recentNotes: RecentNote[] | null;
	remarks: string | null;
	serviceDate: string;
};

async function fetchServiceNoteData(
	serviceNoteId: string,
): Promise<ServiceNoteData | null> {
	const results = await db.execute<ServiceNoteData>(sql`
		SELECT
			cn.id,
			cn.customer_id as "customerId",
			cn.content,
			cn.service_date as "serviceDate",
			c.first_name as "firstName",
			c.last_name as "lastName",
			c.birth_date as "birthDate",
			c.gender,
			c.remarks,
			(
				SELECT COALESCE(json_agg(
					json_build_object('content', rn.content, 'createdAt', rn.created_at)
					ORDER BY rn.created_at DESC
				), '[]'::json)
				FROM (
					SELECT content, created_at
					FROM ${sql.identifier(schemaName)}.customer_notes
					WHERE customer_id = cn.customer_id
						AND created_at < cn.created_at
					ORDER BY created_at DESC
					LIMIT ${RECENT_NOTES_LIMIT}
				) rn
			) as "recentNotes"
		FROM ${sql.identifier(schemaName)}.customer_notes cn
		INNER JOIN ${sql.identifier(schemaName)}.customers c ON cn.customer_id = c.customer_id
		WHERE cn.id = ${serviceNoteId}::uuid
	`);

	return results[0] ?? null;
}

async function saveAdvice(
	customerNoteId: string,
	advice: AdviceContent,
): Promise<void> {
	await db.insert(customerNoteAdviceTable).values({
		advice,
		customerNoteId,
	});
}

type GenerateServiceAdviceResult = {
	customerId: string;
};

export async function generateServiceAdvice(
	serviceNoteId: string,
): Promise<Result<GenerateServiceAdviceResult, GenerateServiceAdviceError>> {
	const note = await fetchServiceNoteData(serviceNoteId);

	if (!note) {
		return fail(SERVICE_NOTE_NOT_FOUND_ERROR);
	}

	const recentNotes = (note.recentNotes ?? []).map((n) => ({
		content: n.content,
		createdAt: new Date(n.createdAt),
	}));

	const advice = await generateAdviceContent({
		customer: {
			birthDate: note.birthDate,
			firstName: note.firstName,
			gender: v.parse(genderSchema, note.gender),
			lastName: note.lastName,
			remarks: note.remarks,
		},
		noteContent: note.content,
		recentNotes,
		serviceDate: note.serviceDate,
	});

	await saveAdvice(serviceNoteId, advice);

	return succeed({ customerId: note.customerId });
}
