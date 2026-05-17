"use client";

import { Loader2 } from "lucide-react";
import { useState } from "react";
import { startChatAction } from "@/features/chat/start/start-chat.action";

export function StartChatButton({
	organizationId,
}: {
	organizationId: string | null;
}) {
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	async function handleStart() {
		if (!organizationId) {
			setError("ご紹介元の指定がないため、ご相談を開始できません。");
			return;
		}
		setSubmitting(true);
		setError(null);
		const result = await startChatAction({ organizationId });
		if (!result.success) {
			setError(result.error || "ご相談の開始に失敗しました。");
			setSubmitting(false);
		}
	}

	return (
		<div className="flex w-full flex-col items-center gap-3">
			<button
				className="group relative inline-flex w-full max-w-xs items-center justify-center gap-3 overflow-hidden border border-[#2A2622] bg-[#2A2622] px-8 py-4 font-[family-name:var(--font-mincho)] text-sm tracking-[0.3em] text-[#FAF7F1] transition-all duration-500 hover:bg-[#3A332C] hover:tracking-[0.4em] disabled:cursor-not-allowed disabled:opacity-50"
				disabled={submitting || !organizationId}
				onClick={handleStart}
				type="button"
			>
				<span className="absolute inset-y-2 left-2 w-2 border-b border-l border-[#B89968]/60 transition-all duration-500 group-hover:left-1 group-hover:w-3" />
				<span className="absolute inset-y-2 right-2 w-2 border-b border-r border-[#B89968]/60 transition-all duration-500 group-hover:right-1 group-hover:w-3" />
				{submitting ? (
					<>
						<Loader2 className="size-3.5 animate-spin" />
						<span>ご 準 備 中</span>
					</>
				) : (
					<span>ご 相 談 を 始 め る</span>
				)}
			</button>
			{error && (
				<p className="text-xs text-[#A24A3D]" role="alert">
					{error}
				</p>
			)}
		</div>
	);
}
