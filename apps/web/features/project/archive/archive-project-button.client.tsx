"use client";

import { Button } from "@workspace/ui/components/button";
import { AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toggleProjectArchiveAction } from "./toggle-project-archive.action";

type ArchiveProjectButtonProps = {
	isArchived: boolean;
	projectId: string;
};

export function ArchiveProjectButton({
	isArchived,
	projectId,
}: ArchiveProjectButtonProps) {
	const router = useRouter();
	const [isPending, startTransition] = useTransition();
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	function handleClick() {
		setErrorMessage(null);

		startTransition(async () => {
			const result = await toggleProjectArchiveAction({ projectId });

			if (!result.success) {
				setErrorMessage(result.error);
				return;
			}

			router.refresh();
		});
	}

	return (
		<div className="flex flex-col gap-1">
			<Button
				disabled={isPending}
				isProcessing={isPending}
				onClick={handleClick}
				processingLabel={isArchived ? "解除中" : "アーカイブ中"}
				size="sm"
				type="button"
				variant="outline"
			>
				{isArchived ? "アーカイブ解除" : "アーカイブ"}
			</Button>
			{errorMessage && (
				<div className="flex items-center gap-1 text-destructive text-xs">
					<AlertCircle className="h-3 w-3 shrink-0" />
					<span>{errorMessage}</span>
				</div>
			)}
		</div>
	);
}
