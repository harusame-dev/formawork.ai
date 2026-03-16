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
import { useState, useTransition } from "react";
import { deleteEventAction } from "../actions/delete-event.action";

type DeleteEventDialogProps = {
	eventId: string;
	eventName: string;
};

export function DeleteEventDialog({
	eventId,
	eventName,
}: DeleteEventDialogProps) {
	const [open, setOpen] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [isPending, startTransition] = useTransition();

	function handleDelete() {
		setError(null);
		startTransition(async () => {
			const result = await deleteEventAction({ eventId });
			if (!result.success) {
				setError(result.error);
			} else {
				setOpen(false);
			}
		});
	}

	return (
		<Dialog onOpenChange={setOpen} open={open}>
			<DialogTrigger asChild>
				<Button className="justify-start" size="sm" variant="ghost">
					<span className="text-destructive">イベント削除</span>
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>イベントを削除しますか？</DialogTitle>
					<DialogDescription>
						イベント「{eventName}」を削除します。
						この操作は取り消せません。関連するボランティア情報もすべて削除されます。
					</DialogDescription>
				</DialogHeader>
				{error && (
					<div className="text-sm text-destructive" role="alert">
						{error}
					</div>
				)}
				<DialogFooter>
					<Button
						disabled={isPending}
						onClick={() => setOpen(false)}
						type="button"
						variant="outline"
					>
						キャンセル
					</Button>
					<Button
						disabled={isPending}
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
