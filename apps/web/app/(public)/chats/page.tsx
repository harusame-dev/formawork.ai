import { Skeleton } from "@workspace/ui/components/skeleton";
import type { Metadata } from "next";
import { Suspense } from "react";
import * as v from "valibot";
import { ChatLandingContainer } from "@/features/chat/landing/landing.server";

export const metadata: Metadata = {
	title: "お見送りサポートチャットを開始する",
};

const searchSchema = v.object({
	org: v.optional(v.string()),
});

const MINCHO_FAMILY =
	'"Hiragino Mincho ProN", "Hiragino Mincho Pro", "Yu Mincho", YuMincho, "Noto Serif JP", "Times New Roman", serif';
const SANS_JP_FAMILY =
	'"Hiragino Kaku Gothic ProN", "Hiragino Sans", "Yu Gothic", YuGothic, "Noto Sans JP", -apple-system, BlinkMacSystemFont, sans-serif';

export default function Page({ searchParams }: PageProps<"/chats">) {
	const parsedPromise = searchParams.then((sp) =>
		v.parse(searchSchema, {
			org: typeof sp["org"] === "string" ? sp["org"] : undefined,
		}),
	);

	return (
		<div
			className="relative h-dvh overflow-y-auto bg-[#FAF7F1] text-[#1F1B17]"
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
				className="pointer-events-none fixed inset-0 -z-10 opacity-[0.55]"
				style={{
					backgroundImage:
						"radial-gradient(1200px 600px at 85% -10%, rgba(217, 161, 153, 0.18), transparent 60%), radial-gradient(900px 500px at -10% 110%, rgba(91, 123, 139, 0.14), transparent 60%), radial-gradient(700px 400px at 50% 50%, rgba(255, 252, 246, 0.6), transparent 70%)",
				}}
			/>
			<div
				aria-hidden
				className="pointer-events-none fixed inset-0 -z-10 opacity-[0.4] mix-blend-multiply"
				style={{
					backgroundImage:
						"url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.55  0 0 0 0 0.50  0 0 0 0 0.42  0 0 0 0.18 0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>\")",
				}}
			/>

			<main className="relative mx-auto flex w-full max-w-2xl flex-col px-5 py-6 sm:px-8 sm:py-12 md:py-16">
				<Suspense
					fallback={
						<div className="flex flex-col gap-4">
							<Skeleton className="h-6 w-40 bg-[#EDE6D9]" />
							<Skeleton className="h-[420px] w-full bg-[#EDE6D9]" />
						</div>
					}
				>
					<LandingWrapper parsedPromise={parsedPromise} />
				</Suspense>
			</main>
		</div>
	);
}

async function LandingWrapper({
	parsedPromise,
}: {
	parsedPromise: Promise<{ org?: string }>;
}) {
	const parsed = await parsedPromise;
	return <ChatLandingContainer org={parsed.org} />;
}
