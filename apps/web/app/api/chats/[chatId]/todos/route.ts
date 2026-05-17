import { NextResponse } from "next/server";
import { getChatTodos } from "@/features/chat/todos/get-todos";

export async function GET(
	_request: Request,
	context: { params: Promise<{ chatId: string }> },
) {
	const { chatId } = await context.params;
	const todos = await getChatTodos(chatId);
	return NextResponse.json(
		{ todos },
		{
			headers: {
				"Cache-Control": "no-store, no-cache, must-revalidate",
			},
		},
	);
}
