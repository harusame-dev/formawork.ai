"use server";

import { redirect } from "next/navigation";
import { createServerAction } from "@/libs/create-server-action";
import { deleteEvent, deleteEventSchema } from "./delete-event";

export const deleteEventAction = createServerAction(deleteEvent, {
	name: "deleteEventAction",
	onSuccess: () => {
		redirect("/events");
	},
	schema: deleteEventSchema,
});
