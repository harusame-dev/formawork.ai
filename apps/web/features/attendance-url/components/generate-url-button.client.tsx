"use client";

import { Button } from "@workspace/ui/components/button";
import { AlertCircle } from "lucide-react";
import { useState, useTransition } from "react";
import { generateAttendanceUrlAction } from "../actions/generate-attendance-url.action";

type GenerateUrlButtonProps = {
	eventId: string;
};

export function GenerateUrlButton({ eventId }: GenerateUrlButtonProps) {
	const [isPending, startTransition] = useTransition();
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	function handleGenerate() {
		setErrorMessage(null);

		startTransition(async () => {
			const result = await generateAttendanceUrlAction({ eventId });

			if (!result.success) {
				setErrorMessage(result.error);
			}
		});
	}

	return (
		<div className="flex flex-col items-center gap-4">
			{errorMessage && (
				<div className="bg-destructive/10 text-destructive flex items-center gap-2 rounded-md p-3 text-sm">
					<AlertCircle className="h-4 w-4 shrink-0" />
					<p>{errorMessage}</p>
				</div>
			)}
			<Button
				isProcessing={isPending}
				onClick={handleGenerate}
				processingLabel="生成中"
				type="button"
			>
				URLを生成する
			</Button>
		</div>
	);
}
