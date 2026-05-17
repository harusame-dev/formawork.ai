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
import { Trash } from "lucide-react";
import { useState } from "react";
import { deleteOrganizationAction } from "./delete-organization.action";

export function DeleteOrganizationDialog({
	organizationId,
	organizationName,
}: {
	organizationId: string;
	organizationName: string;
}) {
	const [open, setOpen] = useState(false);
	const [isProcessing, setIsProcessing] = useState(false);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	async function handleDelete() {
		setIsProcessing(true);
		setErrorMessage(null);
		const result = await deleteOrganizationAction({ organizationId });
		if (!result.success) {
			setErrorMessage(result.error || "削除に失敗しました");
			setIsProcessing(false);
		}
	}

	return (
		<Dialog onOpenChange={setOpen} open={open}>
			<DialogTrigger asChild>
				<Button size="sm" variant="destructive">
					<Trash className="size-4" />
					削除
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>組織を削除しますか？</DialogTitle>
					<DialogDescription>
						「{organizationName}
						」を削除します。この操作は取り消せません。
					</DialogDescription>
				</DialogHeader>
				{errorMessage && (
					<p className="text-sm text-destructive" role="alert">
						{errorMessage}
					</p>
				)}
				<DialogFooter>
					<Button
						disabled={isProcessing}
						onClick={() => setOpen(false)}
						variant="outline"
					>
						キャンセル
					</Button>
					<Button
						disabled={isProcessing}
						isProcessing={isProcessing}
						onClick={handleDelete}
						processingLabel="削除中"
						variant="destructive"
					>
						削除する
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
