"use server";

import { revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { createServerAction } from "@/libs/create-server-action";
import { VolunteerTag } from "../tag";
import { updateVolunteerSchema } from "./schema";
import { updateVolunteer } from "./update-volunteer";

export const updateVolunteerAction = createServerAction(updateVolunteer, {
	name: "updateVolunteerAction",
	onSuccess: ({ input }) => {
		revalidateTag(VolunteerTag.List(input.eventId), "max");
		revalidateTag(VolunteerTag.Detail(input.volunteerId), "max");
		redirect(`/events/${input.eventId}/volunteers`);
	},
	schema: updateVolunteerSchema,
});
