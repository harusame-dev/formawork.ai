"use server";

import * as v from "valibot";
import { createServerAction } from "@/libs/create-server-action";
import { lookupVolunteer } from "./lookup-volunteer";

const lookupVolunteerSchema = v.object({
	code: v.pipe(
		v.string(),
		v.regex(/^\d{6}$/, "IDは6桁の数字で入力してください"),
	),
	eventId: v.pipe(v.string(), v.uuid()),
});

export const lookupVolunteerAction = createServerAction(lookupVolunteer, {
	isPublic: true,
	name: "lookupVolunteerAction",
	schema: lookupVolunteerSchema,
});
