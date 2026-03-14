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
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import * as v from "valibot";
import type { ProjectOption } from "@/features/task/list/get-project-options";
import {
	taskDescriptionSchema,
	taskDueDateSchema,
	taskNameSchema,
} from "@/features/task/schema";
import { TaskStatus, TaskStatusLabel } from "@/features/task/status";
import { AssigneeMultiSelect } from "@/features/user/assignee-multi-select.client";
import type { UserOption } from "@/features/user/list/get-user-options";
import { useIsHydrated } from "@/libs/use-is-hydrated.hook";
import { registerTaskAction } from "./register-task.action";

const formSchema = v.object({
	assigneeIds: v.array(v.pipe(v.string(), v.uuid())),
	description: v.optional(taskDescriptionSchema),
	dueDate: taskDueDateSchema,
	name: taskNameSchema,
	projectId: v.pipe(v.string(), v.uuid("プロジェクトを選択してください")),
	status: v.picklist(["todo", "in_progress", "done"]),
});

type FormValues = v.InferOutput<typeof formSchema>;

type Props = {
	assigneeOptions: UserOption[];
	projectOptions: ProjectOption[];
	projectId?: string;
};

export function RegisterTaskPageForm({
	assigneeOptions,
	projectId,
	projectOptions,
}: Props) {
	const router = useRouter();
	const { isHydrated } = useIsHydrated();

	const form = useForm<FormValues>({
		defaultValues: {
			assigneeIds: [],
			description: "",
			dueDate: undefined,
			name: "",
			projectId: projectId ?? "",
			status: "todo" as const,
		},
		resolver: valibotResolver(formSchema),
	});

	async function onSubmit(values: FormValues) {
		form.clearErrors("root");

		const result = await registerTaskAction({
			assigneeIds: values.assigneeIds,
			description: values.description,
			dueDate: values.dueDate,
			name: values.name,
			projectId: values.projectId,
			status: values.status,
		});

		if (!result.success) {
			form.setError("root", {
				message: result.error || "エラーが発生しました",
			});
			return;
		}

		router.push(projectId ? `/projects/${projectId}` : "/tasks");
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
					name="projectId"
					render={({ field }) => (
						<FormItem>
							<FormLabel className="flex items-center gap-2">
								プロジェクト
								<RequiredBadge />
							</FormLabel>
							<Select
								defaultValue={field.value}
								disabled={disabled || !!projectId}
								onValueChange={field.onChange}
							>
								<FormControl>
									<SelectTrigger className="max-w-xs">
										<SelectValue placeholder="プロジェクトを選択" />
									</SelectTrigger>
								</FormControl>
								<SelectContent>
									{projectOptions.map((option) => (
										<SelectItem key={option.projectId} value={option.projectId}>
											{option.name}
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
					name="assigneeIds"
					render={({ field }) => (
						<FormItem>
							<FormLabel>担当者</FormLabel>
							<FormControl>
								<AssigneeMultiSelect
									disabled={disabled}
									onChange={field.onChange}
									options={assigneeOptions}
									value={field.value}
								/>
							</FormControl>
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
						disabled={disabled}
						onClick={() => router.back()}
						type="button"
						variant="outline"
					>
						キャンセル
					</Button>
					<Button
						className="min-w-[120px]"
						disabled={disabled}
						isProcessing={form.formState.isSubmitting}
						processingLabel="登録中"
						type="submit"
					>
						登録する
					</Button>
				</div>
			</form>
		</Form>
	);
}
