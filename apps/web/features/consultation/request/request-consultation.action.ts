"use server";

import { updateTag } from "next/cache";
import { ChatTag } from "@/features/chat/tag";
import { createServerAction } from "@/libs/create-server-action";
import { ConsultationTag } from "../tag";
import { requestConsultation } from "./request-consultation";
import { requestConsultationSchema } from "./schema";

export const requestConsultationAction = createServerAction(
	requestConsultation,
	{
		isPublic: true,
		name: "requestConsultationAction",
		onSuccess: ({ input }) => {
			updateTag(ChatTag.Detail(input.chatId));
			updateTag(ConsultationTag.ByOrg(input.targetOrgId));
			updateTag(ConsultationTag.List);
		},
		schema: requestConsultationSchema,
	},
);
