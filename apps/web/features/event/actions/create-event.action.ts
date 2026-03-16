"use server";

import { redirect } from "next/navigation";
import { createServerAction } from "@/libs/create-server-action";
import { createEvent } from "./create-event";
import { eventFormSchema } from "./schema";

export const createEventAction = createServerAction(createEvent, {
	name: "createEventAction",
	onSuccess: ({ result }) => {
		redirect(`/events/${result.eventId}`);
	},
	schema: eventFormSchema,
});
