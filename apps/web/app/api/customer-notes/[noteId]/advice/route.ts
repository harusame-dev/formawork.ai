import { createClient } from "@repo/supabase/nextjs/server";
import { NextResponse } from "next/server";
import { getLatestAdvice } from "@/features/customer-note/advice/get-latest-advice";

export async function GET(
	_request: Request,
	{ params }: { params: Promise<{ noteId: string }> },
) {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		return new NextResponse(null, { status: 401 });
	}

	const { noteId } = await params;
	const advice = await getLatestAdvice(noteId);

	return NextResponse.json(advice);
}
