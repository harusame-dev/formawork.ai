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
	// アドバイスは同一サロン内の全従業員が閲覧可能な情報であるため、
	// noteId の所有者（担当者）と一致するかの認可チェックは行わない。
	// 認証済みユーザーであれば、他の従業員が作成したアドバイスも参照できる。
	const advice = await getLatestAdvice(noteId);

	return NextResponse.json(advice);
}
