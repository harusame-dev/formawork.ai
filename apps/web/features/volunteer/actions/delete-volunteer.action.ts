"use server";

import { revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import * as v from "valibot";
import { createServerAction } from "@/libs/create-server-action";
import { VolunteerTag } from "../tag";
import { deleteVolunteer } from "./delete-volunteer";

const deleteVolunteerSchema = v.object({
	eventId: v.pipe(v.string(), v.uuid()),
	volunteerId: v.pipe(v.string(), v.uuid()),
});

export const deleteVolunteerAction = createServerAction(deleteVolunteer, {
	name: "deleteVolunteerAction",
	onSuccess: ({ input }) => {
		revalidateTag(VolunteerTag.List(input.eventId), "max");
		revalidateTag(VolunteerTag.Detail(input.volunteerId), "max");
		redirect(`/events/${input.eventId}/volunteers`);
	},
	schema: deleteVolunteerSchema,
});
