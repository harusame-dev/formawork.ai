import { Suspense } from "react";
import { ChatDetailContainer } from "@/features/chat-history/chat-detail.server";
import { ChatHistorySkeleton } from "@/features/chat-history/chat-history-skeleton.universal";

export default function Page({ params }: PageProps<"/chat-history/[chatId]">) {
	const chatIdPromise = params.then((p) => p.chatId);

	return (
		<div className="container mx-auto p-4 flex flex-col gap-4">
			<h1 className="text-xl font-semibold">チャット詳細</h1>
			<Suspense fallback={<ChatHistorySkeleton />}>
				<ChatDetailWithAuth chatIdPromise={chatIdPromise} />
			</Suspense>
		</div>
	);
}

async function ChatDetailWithAuth({
	chatIdPromise,
}: {
	chatIdPromise: Promise<string>;
}) {
	const chatId = await chatIdPromise;
	return <ChatDetailContainer chatId={chatId} requireAdmin />;
}
