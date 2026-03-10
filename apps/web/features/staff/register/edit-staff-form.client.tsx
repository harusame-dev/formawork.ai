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
import { Label } from "@workspace/ui/components/label";
import {
	RadioGroup,
	RadioGroupItem,
} from "@workspace/ui/components/radio-group";
import { RequiredBadge } from "@workspace/ui/components/required-badge";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import * as v from "valibot";
import { UserRole } from "@/features/auth/user/role";
import { editStaffAction } from "@/features/staff/edit/edit-staff.action";
import { useIsHydrated } from "@/libs/use-is-hydrated.hook";
import {
	staffEmailSchema,
	staffFirstNameSchema,
	staffLastNameSchema,
	staffPasswordSchema,
	staffRoleSchema,
} from "../schema";
import { registerStaffAction } from "./register-staff.action";

const registerSchema = v.object({
	email: staffEmailSchema,
	firstName: staffFirstNameSchema,
	lastName: staffLastNameSchema,
	password: staffPasswordSchema,
	role: staffRoleSchema,
});

const editSchema = v.object({
	email: staffEmailSchema,
	firstName: staffFirstNameSchema,
	lastName: staffLastNameSchema,
	role: staffRoleSchema,
});

type RegisterFormValues = v.InferOutput<typeof registerSchema>;
type EditFormValues = v.InferOutput<typeof editSchema>;
type FormValues = RegisterFormValues | EditFormValues;

type EditStaffFormProps =
	| {
			disabled?: boolean;
			staffId?: undefined;
			authUserId?: undefined;
			initialValues?: undefined;
			isSelf?: undefined;
	  }
	| {
			disabled?: boolean;
			staffId: string;
			authUserId: string;
			initialValues: {
				email: string;
				firstName: string;
				lastName: string;
				role: string;
			};
			isSelf: boolean;
	  };

export function EditStaffForm({
	disabled: disabledProp,
	staffId,
	authUserId,
	initialValues,
	isSelf,
}: EditStaffFormProps) {
	const router = useRouter();
	const { isHydrated } = useIsHydrated();
	const isEditMode = !!staffId;

	const form = useForm<FormValues>({
		defaultValues: isEditMode
			? {
					email: initialValues?.email ?? "",
					firstName: initialValues?.firstName ?? "",
					lastName: initialValues?.lastName ?? "",
					role: (initialValues?.role as UserRole) ?? UserRole.User,
				}
			: {
					email: "",
					firstName: "",
					lastName: "",
					password: "",
					role: UserRole.User,
				},
		resolver: valibotResolver(isEditMode ? editSchema : registerSchema),
	});

	async function onSubmit(values: FormValues) {
		form.clearErrors("root");

		if (isEditMode && authUserId && initialValues) {
			const result = await editStaffAction({
				authUserId,
				email: values.email,
				firstName: values.firstName,
				lastName: values.lastName,
				originalRole: initialValues.role,
				role: values.role,
				staffId,
			});

			if (!result.success) {
				form.setError("root", {
					message: result.error || "エラーが発生しました",
				});
			}
		} else {
			const registerValues = values as RegisterFormValues;
			const result = await registerStaffAction(registerValues);

			if (!result.success) {
				form.setError("root", {
					message: result.error || "エラーが発生しました",
				});
			}
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
					name="lastName"
					render={({ field }) => (
						<FormItem>
							<FormLabel className="flex items-center gap-2">
								姓
								<RequiredBadge />
							</FormLabel>
							<FormDescription>24文字以内で入力してください</FormDescription>
							<FormControl>
								<Input
									autoComplete="family-name"
									className="max-w-xs"
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
					name="firstName"
					render={({ field }) => (
						<FormItem>
							<FormLabel className="flex items-center gap-2">
								名
								<RequiredBadge />
							</FormLabel>
							<FormDescription>24文字以内で入力してください</FormDescription>
							<FormControl>
								<Input
									autoComplete="given-name"
									className="max-w-xs"
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
					name="email"
					render={({ field }) => (
						<FormItem>
							<FormLabel className="flex items-center gap-2">
								メールアドレス
								<RequiredBadge />
							</FormLabel>
							<FormDescription>
								ログインに使用するメールアドレスを入力してください
							</FormDescription>
							<FormControl>
								<Input
									autoComplete="email"
									className="max-w-sm"
									disabled={disabled}
									type="email"
									{...field}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				{!isEditMode && (
					<FormField
						control={form.control}
						name="password"
						render={({ field }) => (
							<FormItem>
								<FormLabel className="flex items-center gap-2">
									パスワード
									<RequiredBadge />
								</FormLabel>
								<FormDescription>
									8文字以上128文字以内で入力してください
								</FormDescription>
								<FormControl>
									<Input
										autoComplete="new-password"
										className="max-w-sm"
										disabled={disabled}
										type="password"
										{...field}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				)}

				<FormField
					control={form.control}
					name="role"
					render={({ field }) => (
						<FormItem>
							<FormLabel className="flex items-center gap-2">
								ロール
								<RequiredBadge />
							</FormLabel>
							<FormDescription>
								一般は顧客一覧・詳細の表示とノートの一覧・編集・削除が可能。管理者は一般に加えて顧客の登録・編集・削除、スタッフの一覧・登録・編集・削除が可能
							</FormDescription>
							{isSelf && (
								<p className="text-sm text-muted-foreground">
									自分自身のロールは変更できません
								</p>
							)}
							<FormControl>
								<RadioGroup
									defaultValue={field.value}
									disabled={disabled || isSelf}
									onValueChange={field.onChange}
								>
									<div className="flex items-center gap-2">
										<RadioGroupItem id="role-user" value={UserRole.User} />
										<Label htmlFor="role-user">一般</Label>
									</div>
									<div className="flex items-center gap-2">
										<RadioGroupItem id="role-admin" value={UserRole.Admin} />
										<Label htmlFor="role-admin">管理者</Label>
									</div>
								</RadioGroup>
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
