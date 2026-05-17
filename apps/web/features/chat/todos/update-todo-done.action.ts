"use server";

import * as v from "valibot";
import { createServerAction } from "@/libs/create-server-action";
import { updateTodoDone } from "./update-todo-done";

const updateTodoDoneSchema = v.object({
	chatId: v.pipe(v.string(), v.uuid()),
	done: v.boolean(),
	todoId: v.pipe(v.string(), v.uuid()),
});

export const updateTodoDoneAction = createServerAction(updateTodoDone, {
	isPublic: true,
	name: "updateTodoDoneAction",
	schema: updateTodoDoneSchema,
});
