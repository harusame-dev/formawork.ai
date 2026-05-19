import { db } from "@workspace/db/client";
import { schemaName } from "@workspace/db/pgschema";
import { sql } from "drizzle-orm";

const RECENT_NOTES_LIMIT = 10;

interface CustomerMemory {
  category: number;
  content: string;
  importance: number;
}

interface RecentNote {
  content: string;
  serviceDate: string;
}

interface ServiceNoteData {
  birthDate: string | null;
  content: string;
  customerId: string;
  firstName: string;
  gender: number;
  id: string;
  lastName: string;
  memories: CustomerMemory[] | null;
  recentNotes: RecentNote[] | null;
  remarks: string | null;
  serviceDate: string;
}

export async function fetchServiceNoteData(
  serviceNoteId: string,
): Promise<ServiceNoteData | null> {
  const results = (await db.execute(sql`
		SELECT
			note.customer_note_id,
			note.customer_id as "customerId",
			note.content,
			note.service_date as "serviceDate",
			customer.first_name as "firstName",
			customer.last_name as "lastName",
			customer.birth_date as "birthDate",
			customer.gender,
			customer.remarks,
			(
				SELECT COALESCE(json_agg(
					json_build_object('content', recent.content, 'serviceDate', recent.service_date)
					ORDER BY recent.service_date DESC
				), '[]'::json)
				FROM (
					SELECT content, service_date
					FROM ${sql.identifier(schemaName)}.customer_notes
					WHERE customer_id = note.customer_id
						AND service_date <= note.service_date
					ORDER BY created_at DESC
					LIMIT ${RECENT_NOTES_LIMIT}
				) recent
			) as "recentNotes",
			(
				SELECT COALESCE(json_agg(
					json_build_object('category', mem.category, 'content', mem.content, 'importance', mem.importance)
					ORDER BY mem.importance DESC, mem.updated_at DESC
				), '[]'::json)
				FROM ${sql.identifier(schemaName)}.customer_memories mem
				WHERE mem.customer_id = note.customer_id
			) as "memories"
		FROM ${sql.identifier(schemaName)}.customer_notes note
		INNER JOIN ${sql.identifier(schemaName)}.customers customer ON note.customer_id = customer.customer_id
		WHERE note.customer_note_id = ${serviceNoteId}::uuid
	`)) as unknown as ServiceNoteData[];

  return results[0] ?? null;
}
