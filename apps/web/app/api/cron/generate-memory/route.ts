import { getLogger } from "@repo/logger/nextjs/server";
import { NextResponse } from "next/server";
import { processMemoryQueue } from "@/features/customer-memory/process-memory-queue";

export async function GET() {
	const logger = await getLogger("generateMemoryCron");
	logger.info("顧客メモリー生成キュー実行");

	try {
		await processMemoryQueue();
		return new NextResponse();
	} catch (error) {
		logger.error("顧客メモリー生成に失敗", { err: error });
		return new NextResponse(null, { status: 500 });
	}
}
