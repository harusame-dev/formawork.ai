"use client";

import { valibotResolver } from "@hookform/resolvers/valibot";
import { Button } from "@workspace/ui/components/button";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@workspace/ui/components/form";
import { Input } from "@workspace/ui/components/input";
import { RequiredBadge } from "@workspace/ui/components/required-badge";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@workspace/ui/components/select";
import { Textarea } from "@workspace/ui/components/textarea";
import { useForm } from "react-hook-form";
import * as v from "valibot";
import { editTaskAction } from "@/features/task/edit/edit-task.action";
import {
	taskDescriptionSchema,
	taskDueDateSchema,
	taskNameSchema,
} from "@/features/task/schema";
import { TaskStatus, TaskStatusLabel } from "@/features/task/status";
import type { UserOption } from "@/features/user/list/get-user-options";
import { useIsHydrated } from "@/libs/use-is-hydrated.hook";
import { registerTaskAction } from "./register-task.action";

const formSchema = v.object({
	assigneeId: v.pipe(v.string(), v.uuid("担当者を選択してください")),
	description: v.optional(taskDescriptionSchema),
	dueDate: taskDueDateSchema,
	name: taskNameSchema,
	status: v.picklist(["todo", "in_progress", "done"]),
});

type FormValues = v.InferOutput<typeof formSchema>;

type TaskFormProps =
	| {
			assigneeOptions: UserOption[];
			initialValues?: undefined;
			mode: "register";
			onSuccess?: () => void;
			projectId: string;
			taskId?: undefined;
	  }
	| {
			assigneeOptions: UserOption[];
			initialValues: {
				assigneeId: string;
				description: string | null;
				dueDate: string | null;
				name: string;
				status: string;
			};
			mode: "edit";
			onSuccess?: () => void;
			projectId: string;
			taskId: string;
	  };

export function TaskForm({
	assigneeOptions,
	initialValues,
	mode,
	onSuccess,
	projectId,
	taskId,
}: TaskFormProps) {
	const { isHydrated } = useIsHydrated();

	const form = useForm<FormValues>({
		defaultValues:
			mode === "edit" && initialValues
				? {
						assigneeId: initialValues.assigneeId,
						description: initialValues.description ?? "",
						dueDate: initialValues.dueDate ?? undefined,
						name: initialValues.name,
						status: initialValues.status as "todo" | "in_progress" | "done",
					}
				: {
						assigneeId: "",
						description: "",
						dueDate: undefined,
						name: "",
						status: "todo" as const,
					},
		resolver: valibotResolver(formSchema),
	});

	async function onSubmit(values: FormValues) {
		form.clearErrors("root");

		if (mode === "edit" && taskId) {
			const result = await editTaskAction({
				assigneeId: values.assigneeId,
				description: values.description,
				dueDate: values.dueDate,
				name: values.name,
				projectId,
				status: values.status,
				taskId,
			});

			if (!result.success) {
				form.setError("root", {
					message: result.error || "エラーが発生しました",
				});
				return;
			}
		} else {
			const result = await registerTaskAction({
				assigneeId: values.assigneeId,
				description: values.description,
				dueDate: values.dueDate,
				name: values.name,
				projectId,
				status: values.status,
			});

			if (!result.success) {
				form.setError("root", {
					message: result.error || "エラーが発生しました",
				});
				return;
			}
		}

		onSuccess?.();
	}

	const disabled = !!(form.formState.isSubmitting || !isHydrated);

	return (
		<Form {...form}>
			<form
				className="flex flex-col gap-4"
				noValidate
				onSubmit={form.handleSubmit(onSubmit)}
			>
				<FormField
					control={form.control}
					name="name"
					render={({ field }) => (
						<FormItem>
							<FormLabel className="flex items-center gap-2">
								タスク名
								<RequiredBadge />
							</FormLabel>
							<FormControl>
								<Input
									className="max-w-sm"
									disabled={disabled}
									type="text"
									{...field}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="status"
					render={({ field }) => (
						<FormItem>
							<FormLabel className="flex items-center gap-2">
								ステータス
								<RequiredBadge />
							</FormLabel>
							<Select
								defaultValue={field.value}
								disabled={disabled}
								onValueChange={field.onChange}
							>
								<FormControl>
									<SelectTrigger className="max-w-xs">
										<SelectValue placeholder="ステータスを選択" />
									</SelectTrigger>
								</FormControl>
								<SelectContent>
									{Object.entries(TaskStatus).map(([, value]) => (
										<SelectItem key={value} value={value}>
											{TaskStatusLabel[value]}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="assigneeId"
					render={({ field }) => (
						<FormItem>
							<FormLabel className="flex items-center gap-2">
								担当者
								<RequiredBadge />
							</FormLabel>
							<Select
								defaultValue={field.value}
								disabled={disabled}
								onValueChange={field.onChange}
							>
								<FormControl>
									<SelectTrigger className="max-w-xs">
										<SelectValue placeholder="担当者を選択" />
									</SelectTrigger>
								</FormControl>
								<SelectContent>
									{assigneeOptions.map((option) => (
										<SelectItem key={option.userId} value={option.userId}>
											{option.fullName}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="dueDate"
					render={({ field }) => (
						<FormItem>
							<FormLabel>期限</FormLabel>
							<FormControl>
								<Input
									className="max-w-xs"
									disabled={disabled}
									type="date"
									{...field}
									value={field.value ?? ""}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="description"
					render={({ field }) => (
						<FormItem>
							<FormLabel>詳細説明</FormLabel>
							<FormControl>
								<Textarea
									className="max-w-lg"
									disabled={disabled}
									rows={3}
									{...field}
									value={field.value ?? ""}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				{form.formState.errors.root && (
					<div className="text-sm text-destructive" role="alert">
						{form.formState.errors.root.message}
					</div>
				)}

				<div className="flex gap-2">
					<Button
						className="min-w-[120px]"
						disabled={disabled}
						isProcessing={form.formState.isSubmitting}
						processingLabel={mode === "edit" ? "編集中" : "登録中"}
						type="submit"
					>
						{mode === "edit" ? "編集する" : "登録する"}
					</Button>
				</div>
			</form>
		</Form>
	);
}
