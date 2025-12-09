import { getLogger } from "@repo/logger/nextjs/server";
import { NextResponse } from "next/server";
import { processAdviceQueue } from "../../../../features/customer-note/advice/process-advice-queue";

export async function GET() {
	const logger = await getLogger("generateAdviceCron");
	logger.info("顧客ノートアドバイス生成キュー実行");

	try {
		await processAdviceQueue();
		return new NextResponse();
	} catch (error) {
		logger.error("顧客ノートアドバイス生成に失敗", { err: error });
		return new NextResponse(null, { status: 500 });
	}
}
