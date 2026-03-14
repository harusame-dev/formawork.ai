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
import { Textarea } from "@workspace/ui/components/textarea";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import * as v from "valibot";
import { editProjectAction } from "@/features/project/edit/edit-project.action";
import {
	projectDescriptionSchema,
	projectDueDateSchema,
	projectNameSchema,
} from "@/features/project/schema";
import { AssigneeMultiSelect } from "@/features/user/assignee-multi-select.client";
import type { UserOption } from "@/features/user/list/get-user-options";
import { useIsHydrated } from "@/libs/use-is-hydrated.hook";
import { registerProjectAction } from "./register-project.action";

const formSchema = v.object({
	assigneeIds: v.array(v.pipe(v.string(), v.uuid())),
	description: v.optional(projectDescriptionSchema),
	dueDate: projectDueDateSchema,
	name: projectNameSchema,
});

type FormValues = v.InferOutput<typeof formSchema>;

type ProjectFormProps =
	| {
			assigneeOptions: UserOption[];
			initialValues?: undefined;
			mode: "register";
			projectId?: undefined;
	  }
	| {
			assigneeOptions: UserOption[];
			initialValues: {
				assigneeIds: string[];
				description: string | null;
				dueDate: string | null;
				name: string;
			};
			mode: "edit";
			projectId: string;
	  };

export function ProjectForm({
	assigneeOptions,
	initialValues,
	mode,
	projectId,
}: ProjectFormProps) {
	const router = useRouter();
	const { isHydrated } = useIsHydrated();

	const form = useForm<FormValues>({
		defaultValues:
			mode === "edit" && initialValues
				? {
						assigneeIds: initialValues.assigneeIds,
						description: initialValues.description ?? "",
						dueDate: initialValues.dueDate ?? undefined,
						name: initialValues.name,
					}
				: {
						assigneeIds: [],
						description: "",
						dueDate: undefined,
						name: "",
					},
		resolver: valibotResolver(formSchema),
	});

	async function onSubmit(values: FormValues) {
		form.clearErrors("root");

		if (mode === "edit" && projectId) {
			const result = await editProjectAction({
				assigneeIds: values.assigneeIds,
				description: values.description,
				dueDate: values.dueDate,
				name: values.name,
				projectId,
			});

			if (!result.success) {
				form.setError("root", {
					message: result.error || "エラーが発生しました",
				});
				return;
			}

			router.push(`/projects/${projectId}`);
		} else {
			const result = await registerProjectAction({
				assigneeIds: values.assigneeIds,
				description: values.description,
				dueDate: values.dueDate,
				name: values.name,
			});

			if (!result.success) {
				form.setError("root", {
					message: result.error || "エラーが発生しました",
				});
				return;
			}

			router.push("/projects");
		}
	}

	const disabled = !!(form.formState.isSubmitting || !isHydrated);

	return (
		<Form {...form}>
			<form
				className="flex flex-col gap-6"
				noValidate
				onSubmit={form.handleSubmit(onSubmit)}
			>
				<FormField
					control={form.control}
					name="name"
					render={({ field }) => (
						<FormItem>
							<FormLabel className="flex items-center gap-2">
								プロジェクト名
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
									rows={4}
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
