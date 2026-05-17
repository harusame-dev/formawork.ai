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
import { KeyRound, Trash } from "lucide-react";
import { useState } from "react";
import { deleteUserAction } from "../delete/delete-user.action";
import { resetPasswordAction } from "../reset-password/reset-password.action";

export function UserActions({
	userId,
	userEmail,
}: {
	userId: string;
	userEmail: string;
}) {
	const [deleteOpen, setDeleteOpen] = useState(false);
	const [resetOpen, setResetOpen] = useState(false);
	const [isProcessing, setIsProcessing] = useState(false);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [newPassword, setNewPassword] = useState<string | null>(null);

	async function handleDelete() {
		setIsProcessing(true);
		setErrorMessage(null);
		const result = await deleteUserAction({ userId });
		if (!result.success) {
			setErrorMessage(result.error || "削除に失敗しました");
			setIsProcessing(false);
		}
	}

	async function handleResetPassword() {
		setIsProcessing(true);
		setErrorMessage(null);
		const result = await resetPasswordAction({ userId });
		if (!result.success) {
			setErrorMessage(result.error || "パスワードリセットに失敗しました");
			setIsProcessing(false);
			return;
		}
		setNewPassword(result.data.password);
		setIsProcessing(false);
	}

	return (
		<div className="flex flex-wrap gap-2">
			<Dialog onOpenChange={setResetOpen} open={resetOpen}>
				<DialogTrigger asChild>
					<Button size="sm" variant="outline">
						<KeyRound className="size-4" />
						パスワードリセット
					</Button>
				</DialogTrigger>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>パスワードをリセットしますか？</DialogTitle>
						<DialogDescription>
							{userEmail}{" "}
							のパスワードを新しく生成します。本人へ手動で通知してください。
						</DialogDescription>
					</DialogHeader>
					{errorMessage && (
						<p className="text-sm text-destructive" role="alert">
							{errorMessage}
						</p>
					)}
					{newPassword && (
						<div className="rounded-md border bg-muted/40 p-3">
							<p className="text-xs text-muted-foreground mb-1">
								新しいパスワード
							</p>
							<code className="text-sm break-all">{newPassword}</code>
							<p className="text-xs text-muted-foreground mt-2">
								画面を閉じると再表示できません。
							</p>
						</div>
					)}
					<DialogFooter>
						<Button
							disabled={isProcessing}
							onClick={() => {
								setResetOpen(false);
								setNewPassword(null);
							}}
							variant="outline"
						>
							閉じる
						</Button>
						{!newPassword && (
							<Button
								disabled={isProcessing}
								isProcessing={isProcessing}
								onClick={handleResetPassword}
								processingLabel="リセット中"
							>
								リセット
							</Button>
						)}
					</DialogFooter>
				</DialogContent>
			</Dialog>

			<Dialog onOpenChange={setDeleteOpen} open={deleteOpen}>
				<DialogTrigger asChild>
					<Button size="sm" variant="destructive">
						<Trash className="size-4" />
						削除する
					</Button>
				</DialogTrigger>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>ユーザーを削除しますか？</DialogTitle>
						<DialogDescription>
							{userEmail} を削除します。この操作は取り消せません。
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
							onClick={() => setDeleteOpen(false)}
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
		</div>
	);
}
