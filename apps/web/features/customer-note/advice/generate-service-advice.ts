import { fail, type Result, succeed } from "@harusame0616/result";
import { db } from "@workspace/db/client";
import {
	type AdviceContent,
	customerNoteAdviceTable,
} from "@workspace/db/schema/customer-note-advice";
import * as v from "valibot";
import { genderSchema } from "@/features/customer/schema";
import { fetchServiceNoteData } from "./fetch-service-note-data";
import { generateAdviceContent } from "./generate-advice-content";

const SERVICE_NOTE_NOT_FOUND_ERROR = "サービスノートが見つかりません" as const;
type GenerateServiceAdviceError = typeof SERVICE_NOTE_NOT_FOUND_ERROR;

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
		createdAt: new Date(n.serviceDate),
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
