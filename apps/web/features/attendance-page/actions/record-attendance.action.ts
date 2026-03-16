"use server";

import * as v from "valibot";
import { createServerAction } from "@/libs/create-server-action";
import { recordAttendance } from "./record-attendance";

const recordAttendanceSchema = v.object({
	volunteerId: v.pipe(v.string(), v.uuid()),
});

export const recordAttendanceAction = createServerAction(recordAttendance, {
	isPublic: true,
	name: "recordAttendanceAction",
	schema: recordAttendanceSchema,
});
