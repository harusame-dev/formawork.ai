"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import * as v from "valibot";
import { VolunteerTag } from "@/features/volunteer/tag";
import { createServerAction } from "@/libs/create-server-action";
import { importVolunteersCsv } from "./import-volunteers-csv";

const importVolunteersCsvSchema = v.object({
	csvContent: v.pipe(
		v.string(),
		v.minLength(1, "CSVファイルを選択してください"),
	),
	eventId: v.pipe(v.string(), v.uuid()),
});

export const importVolunteersCsvAction = createServerAction(
	importVolunteersCsv,
	{
		name: "importVolunteersCsvAction",
		onSuccess: ({ input }) => {
			updateTag(VolunteerTag.List(input.eventId));
			redirect(`/events/${input.eventId}/volunteers`);
		},
		schema: importVolunteersCsvSchema,
	},
);
