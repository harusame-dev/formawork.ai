"use server";

import { redirect } from "next/navigation";
import * as v from "valibot";
import { createServerAction } from "@/libs/create-server-action";
import { startChat } from "./start-chat";

const startChatSchema = v.object({
	organizationId: v.pipe(
		v.string("組織を指定してください"),
		v.uuid("組織を指定してください"),
	),
});

export const startChatAction = createServerAction(startChat, {
	isPublic: true,
	name: "startChatAction",
	onSuccess: ({ result }) => {
		redirect(`/chats/${result.chatId}`);
	},
	schema: startChatSchema,
});
