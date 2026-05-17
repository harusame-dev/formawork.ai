"use client";

import { valibotResolver } from "@hookform/resolvers/valibot";
import { Button } from "@workspace/ui/components/button";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@workspace/ui/components/form";
import { Input } from "@workspace/ui/components/input";
import { OptionalBadge } from "@workspace/ui/components/optional-badge";
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
import { editOrganizationAction } from "@/features/organization/edit/edit-organization.action";
import type { OrganizationCategory } from "@/features/organization-category/get-organization-categories";
import { useIsHydrated } from "@/libs/use-is-hydrated.hook";
import {
	organizationCategoryIdSchema,
	organizationDescriptionSchema,
	organizationEmailSchema,
	organizationNameSchema,
	organizationUrlSchema,
} from "../schema";
import { registerOrganizationAction } from "./register-organization.action";

const formSchema = v.object({
	categoryId: organizationCategoryIdSchema,
	description: organizationDescriptionSchema,
	email: organizationEmailSchema,
	name: organizationNameSchema,
	url: organizationUrlSchema,
});

type FormValues = v.InferOutput<typeof formSchema>;

type OrganizationFormProps =
	| {
			categories: OrganizationCategory[];
			disabled?: boolean;
			lockedCategoryId?: string;
			organizationId?: undefined;
			initialValues?: undefined;
	  }
	| {
			categories: OrganizationCategory[];
			disabled?: boolean;
			lockedCategoryId?: undefined;
			organizationId: string;
			initialValues: FormValues;
	  };

export function OrganizationForm({
	categories,
	disabled: disabledProp,
	lockedCategoryId,
	organizationId,
	initialValues,
}: OrganizationFormProps) {
	const router = useRouter();
	const { isHydrated } = useIsHydrated();
	const isEditMode = !!organizationId;

	const form = useForm<FormValues>({
		defaultValues: initialValues ?? {
			categoryId: lockedCategoryId ?? "",
			description: "",
			email: "",
			name: "",
			url: "",
		},
		resolver: valibotResolver(formSchema),
	});

	async function onSubmit(values: FormValues) {
		form.clearErrors("root");

		const result = isEditMode
			? await editOrganizationAction({ ...values, organizationId })
			: await registerOrganizationAction(values);

		if (!result.success) {
			form.setError("root", {
				message: result.error || "エラーが発生しました",
			});
		}
	}

	const disabled = !!(
		form.formState.isSubmitting ||
		!isHydrated ||
		disabledProp
	);

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
								組織名
								<RequiredBadge />
							</FormLabel>
							<FormDescription>64文字以内で入力してください</FormDescription>
							<FormControl>
								<Input
									className="max-w-md"
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
					name="categoryId"
					render={({ field }) => (
						<FormItem>
							<FormLabel className="flex items-center gap-2">
								カテゴリー
								<RequiredBadge />
							</FormLabel>
							<FormDescription>
								組織が提供するサービスのカテゴリーを選択してください
							</FormDescription>
							<FormControl>
								<Select
									disabled={disabled || !!lockedCategoryId}
									onValueChange={field.onChange}
									value={field.value}
								>
									<SelectTrigger className="w-full max-w-md">
										<SelectValue placeholder="カテゴリーを選択" />
									</SelectTrigger>
									<SelectContent>
										{categories.map((category) => (
											<SelectItem
												key={category.categoryId}
												value={category.categoryId}
											>
												{category.name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="email"
					render={({ field }) => (
						<FormItem>
							<FormLabel className="flex items-center gap-2">
								通知先メールアドレス
								<OptionalBadge />
							</FormLabel>
							<FormDescription>
								相談メールの送信先。未入力の場合、相談ボタンからのメール送信は行いません。
							</FormDescription>
							<FormControl>
								<Input
									autoComplete="email"
									className="max-w-md"
									disabled={disabled}
									type="email"
									{...field}
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
							<FormLabel className="flex items-center gap-2">
								会社概要
								<OptionalBadge />
							</FormLabel>
							<FormDescription>
								1000文字以内で入力してください。チャット画面の相談先企業情報として表示されます。
							</FormDescription>
							<FormControl>
								<Textarea
									className="max-w-md min-h-[120px]"
									disabled={disabled}
									{...field}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="url"
					render={({ field }) => (
						<FormItem>
							<FormLabel className="flex items-center gap-2">
								会社URL
								<OptionalBadge />
							</FormLabel>
							<FormDescription>
								会社の公式サイトのURLを入力してください。
							</FormDescription>
							<FormControl>
								<Input
									autoComplete="url"
									className="max-w-md"
									disabled={disabled}
									inputMode="url"
									placeholder="https://example.com"
									type="url"
									{...field}
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
						processingLabel={isEditMode ? "編集中" : "登録中"}
						type="submit"
					>
						{isEditMode ? "編集する" : "登録する"}
					</Button>
				</div>
			</form>
		</Form>
	);
}
