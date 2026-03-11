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
import { editProjectAction } from "@/features/project/edit/edit-project.action";
import {
	projectDescriptionSchema,
	projectDueDateSchema,
	projectNameSchema,
} from "@/features/project/schema";
import type { UserOption } from "@/features/user/list/get-user-options";
import { useIsHydrated } from "@/libs/use-is-hydrated.hook";
import { registerProjectAction } from "./register-project.action";

const formSchema = v.object({
	assigneeId: v.pipe(v.string(), v.uuid("担当者を選択してください")),
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
				assigneeId: string;
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
						assigneeId: initialValues.assigneeId,
						description: initialValues.description ?? "",
						dueDate: initialValues.dueDate ?? undefined,
						name: initialValues.name,
					}
				: {
						assigneeId: "",
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
				assigneeId: values.assigneeId,
				description: values.description,
				dueDate: values.dueDate,
				name: values.name,
				projectId,
			});

			if (!result.success) {
				form.setError("root", {
					message: result.error || "エラーが発生しました",
				});
			}
		} else {
			const result = await registerProjectAction({
				assigneeId: values.assigneeId,
				description: values.description,
				dueDate: values.dueDate,
				name: values.name,
			});

			if (!result.success) {
				form.setError("root", {
					message: result.error || "エラーが発生しました",
				});
			}
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
								案件名
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
