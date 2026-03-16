"use server";

import { revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { createServerAction } from "@/libs/create-server-action";
import { VolunteerTag } from "../tag";
import { createVolunteer } from "./create-volunteer";
import { createVolunteerSchema } from "./schema";

export const createVolunteerAction = createServerAction(createVolunteer, {
	name: "createVolunteerAction",
	onSuccess: ({ input }) => {
		revalidateTag(VolunteerTag.List(input.eventId), "max");
		redirect(`/events/${input.eventId}/volunteers`);
	},
	schema: createVolunteerSchema,
});
