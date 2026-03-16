"use server";

import { redirect } from "next/navigation";
import { createServerAction } from "@/libs/create-server-action";
import { updateEvent, updateEventSchema } from "./update-event";

export const updateEventAction = createServerAction(updateEvent, {
	name: "updateEventAction",
	onSuccess: ({ input }) => {
		redirect(`/events/${input.eventId}`);
	},
	schema: updateEventSchema,
});
