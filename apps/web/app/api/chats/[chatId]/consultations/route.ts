import { NextResponse } from "next/server";
import { getConsultedOrgIdsByChat } from "@/features/consultation/list/get-consultations-by-chat";

export async function GET(
	_request: Request,
	context: { params: Promise<{ chatId: string }> },
) {
	const { chatId } = await context.params;
	const consultedOrgIds = await getConsultedOrgIdsByChat(chatId);
	return NextResponse.json(
		{ consultedOrgIds },
		{
			headers: {
				"Cache-Control": "no-store, no-cache, must-revalidate",
			},
		},
	);
}
