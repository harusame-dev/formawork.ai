import { Skeleton } from "@workspace/ui/components/skeleton";
import type { Metadata } from "next";
import { Suspense } from "react";
import { ChatRoomContainer } from "@/features/chat/room/chat-room.server";

export const metadata: Metadata = {
	title: "お見送りサポートチャット",
};

const MINCHO_FAMILY =
	'"Hiragino Mincho ProN", "Hiragino Mincho Pro", "Yu Mincho", YuMincho, "Noto Serif JP", "Times New Roman", serif';
const SANS_JP_FAMILY =
	'"Hiragino Kaku Gothic ProN", "Hiragino Sans", "Yu Gothic", YuGothic, "Noto Sans JP", -apple-system, BlinkMacSystemFont, sans-serif';

export default function Page({ params }: PageProps<"/chats/[chatId]">) {
	const chatIdPromise = params.then((p) => p.chatId);

	return (
		<div
			className="relative h-dvh overflow-hidden bg-[#FAF7F1] text-[#1F1B17]"
			style={
				{
					"--font-mincho": MINCHO_FAMILY,
					"--font-sans-jp": SANS_JP_FAMILY,
				} as React.CSSProperties
			}
		>
			<div
				aria-hidden
				className="pointer-events-none fixed inset-0 -z-10 bg-[#FAF7F1]"
			/>
			<div
				aria-hidden
				className="pointer-events-none fixed inset-0 -z-10 opacity-60"
				style={{
					backgroundImage:
						"radial-gradient(1000px 500px at 90% -5%, rgba(217, 161, 153, 0.14), transparent 60%), radial-gradient(800px 500px at -5% 105%, rgba(91, 123, 139, 0.12), transparent 60%)",
				}}
			/>
			<div
				aria-hidden
				className="pointer-events-none fixed inset-0 -z-10 opacity-[0.35] mix-blend-multiply"
				style={{
					backgroundImage:
						"url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.55  0 0 0 0 0.50  0 0 0 0 0.42  0 0 0 0.16 0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>\")",
				}}
			/>

			<div className="relative mx-auto flex h-full w-full max-w-6xl flex-col py-4 sm:px-6">
				<Suspense
					fallback={
						<div className="flex h-full flex-col gap-4">
							<Skeleton className="h-12 w-full bg-[#EDE6D9]/70" />
							<Skeleton className="h-full w-full bg-[#EDE6D9]/70" />
						</div>
					}
				>
					<ChatRoomWrapper chatIdPromise={chatIdPromise} />
				</Suspense>
			</div>
		</div>
	);
}

async function ChatRoomWrapper({
	chatIdPromise,
}: {
	chatIdPromise: Promise<string>;
}) {
	const chatId = await chatIdPromise;
	return <ChatRoomContainer chatId={chatId} />;
}
