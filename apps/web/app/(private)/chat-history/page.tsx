import { Suspense } from "react";
import * as v from "valibot";
import { AllChatsContainer } from "@/features/chat-history/all-chats.server";
import { ChatHistorySkeleton } from "@/features/chat-history/chat-history-skeleton.universal";

const searchSchema = v.object({
	page: v.optional(
		v.fallback(
			v.pipe(
				v.union([v.string(), v.number()]),
				v.transform((value) => Number(value)),
				v.number(),
				v.minValue(1),
			),
			1,
		),
		1,
	),
});

export default function Page({ searchParams }: PageProps<"/chat-history">) {
	const parsedPromise = searchParams.then((sp) =>
		v.parse(searchSchema, {
			page: typeof sp["page"] === "string" ? sp["page"] : 1,
		}),
	);

	return (
		<div className="container mx-auto p-4 flex flex-col gap-4">
			<h1 className="text-xl font-semibold">全チャット履歴</h1>
			<Suspense fallback={<ChatHistorySkeleton />}>
				<AllChatsWrapper parsedPromise={parsedPromise} />
			</Suspense>
		</div>
	);
}

async function AllChatsWrapper({
	parsedPromise,
}: {
	parsedPromise: Promise<{ page: number }>;
}) {
	const parsed = await parsedPromise;
	return <AllChatsContainer page={parsed.page} />;
}
