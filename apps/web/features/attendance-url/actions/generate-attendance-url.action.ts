"use server";

import { revalidateTag } from "next/cache";
import * as v from "valibot";
import { createServerAction } from "@/libs/create-server-action";
import { ATTENDANCE_URL_TAG } from "../tag";
import { generateAttendanceUrl } from "./generate-attendance-url";

const generateAttendanceUrlSchema = v.object({
	eventId: v.pipe(v.string(), v.uuid()),
});

export const generateAttendanceUrlAction = createServerAction(
	async ({ eventId }) => {
		return generateAttendanceUrl({ eventId });
	},
	{
		name: "generateAttendanceUrlAction",
		onSuccess: () => {
			revalidateTag(ATTENDANCE_URL_TAG, "max");
		},
		schema: generateAttendanceUrlSchema,
	},
);
