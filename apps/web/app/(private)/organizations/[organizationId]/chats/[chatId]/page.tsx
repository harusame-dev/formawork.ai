import { Suspense } from "react";
import { ChatDetailContainer } from "@/features/chat-history/chat-detail.server";
import { ChatHistorySkeleton } from "@/features/chat-history/chat-history-skeleton.universal";

export default function Page({
	params,
}: PageProps<"/organizations/[organizationId]/chats/[chatId]">) {
	const paramsPromise = params.then(({ chatId, organizationId }) => ({
		chatId,
		organizationId,
	}));

	return (
		<div className="container mx-auto p-4 flex flex-col gap-4">
			<h1 className="text-xl font-semibold">チャット詳細</h1>
			<Suspense fallback={<ChatHistorySkeleton />}>
				<ChatDetailWithAuth paramsPromise={paramsPromise} />
			</Suspense>
		</div>
	);
}

async function ChatDetailWithAuth({
	paramsPromise,
}: {
	paramsPromise: Promise<{ chatId: string; organizationId: string }>;
}) {
	const { chatId, organizationId } = await paramsPromise;
	return (
		<ChatDetailContainer
			chatId={chatId}
			organizationId={organizationId}
			requireAdmin={false}
		/>
	);
}
