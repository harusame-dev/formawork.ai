"use client";

import { valibotResolver } from "@hookform/resolvers/valibot";
import { Button } from "@workspace/ui/components/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@workspace/ui/components/dialog";
import { Textarea } from "@workspace/ui/components/textarea";
import { AlertCircle } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import type * as v from "valibot";
import { editTaskCommentAction } from "./edit-task-comment.action";
import { editTaskCommentSchema } from "./schema";

type FormValues = v.InferOutput<typeof editTaskCommentSchema>;

type EditTaskCommentDialogProps = {
	commentId: string;
	content: string;
	taskId: string;
};

export function EditTaskCommentDialog({
	commentId,
	content,
	taskId,
}: EditTaskCommentDialogProps) {
	const [open, setOpen] = useState(false);

	const form = useForm<FormValues>({
		defaultValues: {
			commentId,
			content,
			taskId,
		},
		resolver: valibotResolver(editTaskCommentSchema),
	});

	function handleOpenChange(nextOpen: boolean) {
		if (!nextOpen) {
			form.reset({ commentId, content, taskId });
		}
		setOpen(nextOpen);
	}

	async function onSubmit(values: FormValues) {
		form.clearErrors("root");

		const result = await editTaskCommentAction(values);

		if (!result.success) {
			form.setError("root", {
				message: result.error || "エラーが発生しました",
			});
			return;
		}

		setOpen(false);
	}

	return (
		<Dialog onOpenChange={handleOpenChange} open={open}>
			<DialogTrigger asChild>
				<Button size="sm" type="button" variant="outline">
					編集
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>コメントを編集</DialogTitle>
				</DialogHeader>
				<form
					className="flex flex-col gap-3"
					noValidate
					onSubmit={form.handleSubmit(onSubmit)}
				>
					<Textarea
						disabled={form.formState.isSubmitting}
						rows={4}
						{...form.register("content")}
					/>
					{form.formState.errors.content && (
						<p className="text-sm text-destructive">
							{form.formState.errors.content.message}
						</p>
					)}
					{form.formState.errors.root && (
						<div className="bg-destructive/10 text-destructive flex items-center gap-2 rounded-md p-3 text-sm">
							<AlertCircle className="h-4 w-4 shrink-0" />
							<p>{form.formState.errors.root.message}</p>
						</div>
					)}
					<div className="flex justify-end gap-2">
						<Button
							disabled={form.formState.isSubmitting}
							onClick={() => handleOpenChange(false)}
							type="button"
							variant="outline"
						>
							キャンセル
						</Button>
						<Button
							className="min-w-[120px]"
							disabled={form.formState.isSubmitting}
							isProcessing={form.formState.isSubmitting}
							processingLabel="保存中"
							type="submit"
						>
							保存する
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}
