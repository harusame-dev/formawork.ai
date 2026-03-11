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
import { deleteTaskAction } from "./delete-task.action";

type DeleteTaskDialogProps = {
	projectId: string;
	taskId: string;
};

export function DeleteTaskDialog({ projectId, taskId }: DeleteTaskDialogProps) {
	const [open, setOpen] = useState(false);
	const [isPending, startTransition] = useTransition();
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	function handleDelete() {
		setErrorMessage(null);

		startTransition(async () => {
			const result = await deleteTaskAction({ projectId, taskId });

			if (!result.success) {
				setErrorMessage(result.error);
				return;
			}

			setErrorMessage(null);
			setOpen(false);
		});
	}

	function handleOpenChange(open: boolean) {
		if (!open) {
			setErrorMessage(null);
		}
		setOpen(open);
	}

	return (
		<Dialog onOpenChange={handleOpenChange} open={open}>
			<DialogTrigger asChild>
				<Button size="sm" type="button" variant="destructive">
					削除
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>タスクを削除</DialogTitle>
					<DialogDescription>
						タスクを削除してもよろしいですか？この操作は取り消せません。
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
						onClick={handleDelete}
						processingLabel="削除中"
						type="button"
						variant="destructive"
					>
						削除
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
