"use client";

import { valibotResolver } from "@hookform/resolvers/valibot";
import { Button } from "@workspace/ui/components/button";
import { Textarea } from "@workspace/ui/components/textarea";
import { AlertCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import type * as v from "valibot";
import { postTaskCommentAction } from "./post-task-comment.action";
import { postTaskCommentSchema } from "./schema";

type FormValues = v.InferOutput<typeof postTaskCommentSchema>;

type PostTaskCommentFormProps = {
	taskId: string;
};

export function PostTaskCommentForm({ taskId }: PostTaskCommentFormProps) {
	const form = useForm<FormValues>({
		defaultValues: {
			content: "",
			taskId,
		},
		resolver: valibotResolver(postTaskCommentSchema),
	});

	async function onSubmit(values: FormValues) {
		form.clearErrors("root");

		const result = await postTaskCommentAction(values);

		if (!result.success) {
			form.setError("root", {
				message: result.error || "エラーが発生しました",
			});
			return;
		}

		form.reset({ content: "", taskId });
	}

	return (
		<form
			className="flex flex-col gap-2 mt-4"
			noValidate
			onSubmit={form.handleSubmit(onSubmit)}
		>
			<Textarea
				disabled={form.formState.isSubmitting}
				placeholder="コメントを入力してください"
				rows={3}
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
			<div>
				<Button
					className="min-w-[120px]"
					disabled={form.formState.isSubmitting}
					isProcessing={form.formState.isSubmitting}
					processingLabel="投稿中"
					type="submit"
				>
					コメントを投稿
				</Button>
			</div>
		</form>
	);
}
