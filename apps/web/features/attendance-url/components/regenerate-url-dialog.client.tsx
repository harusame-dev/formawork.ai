"use client";

import { Button } from "@workspace/ui/components/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@workspace/ui/components/dialog";
import { AlertCircle } from "lucide-react";
import { useState, useTransition } from "react";
import { generateAttendanceUrlAction } from "../actions/generate-attendance-url.action";

type RegenerateUrlDialogProps = {
	eventId: string;
};

export function RegenerateUrlDialog({ eventId }: RegenerateUrlDialogProps) {
	const [open, setOpen] = useState(false);
	const [isPending, startTransition] = useTransition();
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	function handleRegenerate() {
		setErrorMessage(null);

		startTransition(async () => {
			const result = await generateAttendanceUrlAction({ eventId });

			if (!result.success) {
				setErrorMessage(result.error);
				return;
			}

			setOpen(false);
		});
	}

	function handleOpenChange(nextOpen: boolean) {
		if (!nextOpen) {
			setErrorMessage(null);
		}
		setOpen(nextOpen);
	}

	return (
		<Dialog onOpenChange={handleOpenChange} open={open}>
			<DialogTrigger asChild>
				<Button type="button" variant="outline">
					URLを再生成する
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>URLを再生成する</DialogTitle>
					<DialogDescription>
						URLを再生成すると、現在のURLは無効になります。QRコードも新しいURLのものに更新されます。よろしいですか？
					</DialogDescription>
				</DialogHeader>

				{errorMessage && (
					<div className="bg-destructive/10 text-destructive flex items-center gap-2 rounded-md p-3 text-sm">
						<AlertCircle className="h-4 w-4 shrink-0" />
						<p>{errorMessage}</p>
					</div>
				)}

				<DialogFooter>
					<Button
						disabled={isPending}
						onClick={() => handleOpenChange(false)}
						type="button"
						variant="outline"
					>
						キャンセル
					</Button>
					<Button
						className="min-w-[120px]"
						isProcessing={isPending}
						onClick={handleRegenerate}
						processingLabel="再生成中"
						type="button"
					>
						再生成する
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
