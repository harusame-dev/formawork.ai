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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@workspace/ui/components/select";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as v from "valibot";
import { UserRole } from "@/features/auth/user/role";
import { useIsHydrated } from "@/libs/use-is-hydrated.hook";
import {
	userEmailSchema,
	userOrganizationIdSchema,
	userRoleSchema,
} from "../schema";
import { registerUserAction } from "./register-user.action";

const formSchema = v.object({
	email: userEmailSchema,
	organizationId: userOrganizationIdSchema,
	role: userRoleSchema,
});

type FormValues = v.InferOutput<typeof formSchema>;

type Organization = {
	organizationId: string;
	name: string;
	isSystem: boolean;
};

export function UserRegisterForm({
	organizations,
}: {
	organizations: Organization[];
}) {
	const router = useRouter();
	const { isHydrated } = useIsHydrated();
	const [issuedCredential, setIssuedCredential] = useState<{
		email: string;
		password: string;
	} | null>(null);

	const form = useForm<FormValues>({
		defaultValues: {
			email: "",
			organizationId: "",
			role: UserRole.OrgUser,
		},
		resolver: valibotResolver(formSchema),
	});

	async function onSubmit(values: FormValues) {
		form.clearErrors("root");
		const result = await registerUserAction(values);
		if (!result.success) {
			form.setError("root", {
				message: result.error || "エラーが発生しました",
			});
			return;
		}
		setIssuedCredential({
			email: result.data.email,
			password: result.data.password,
		});
	}

	const disabled = !!(
		form.formState.isSubmitting ||
		!isHydrated ||
		issuedCredential !== null
	);

	if (issuedCredential) {
		return (
			<div className="flex flex-col gap-4 rounded-md border border-amber-200 bg-amber-50 p-4">
				<h2 className="text-base font-semibold text-amber-900">
					ユーザーを登録しました
				</h2>
				<p className="text-sm text-amber-900">
					以下のメールアドレスとパスワードを本人に通知してください。
					<br />
					<strong>このパスワードは画面遷移すると二度と表示できません。</strong>
				</p>
				<div className="flex flex-col gap-1 rounded-md bg-white p-3">
					<span className="text-xs text-muted-foreground">メールアドレス</span>
					<code className="text-sm break-all">{issuedCredential.email}</code>
				</div>
				<div className="flex flex-col gap-1 rounded-md bg-white p-3">
					<span className="text-xs text-muted-foreground">パスワード</span>
					<code className="text-sm break-all">{issuedCredential.password}</code>
				</div>
				<div className="flex gap-2">
					<Button onClick={() => router.push("/users")} variant="outline">
						ユーザー一覧へ
					</Button>
				</div>
			</div>
		);
	}

	return (
		<Form {...form}>
			<form
				className="flex flex-col gap-6"
				noValidate
				onSubmit={form.handleSubmit(onSubmit)}
			>
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
					name="organizationId"
					render={({ field }) => (
						<FormItem>
							<FormLabel className="flex items-center gap-2">
								所属組織
								<RequiredBadge />
							</FormLabel>
							<FormDescription>
								ユーザーが所属する組織を選択してください
							</FormDescription>
							<FormControl>
								<Select
									disabled={disabled}
									onValueChange={field.onChange}
									value={field.value}
								>
									<SelectTrigger className="w-full max-w-md bg-background">
										<SelectValue placeholder="組織を選択" />
									</SelectTrigger>
									<SelectContent>
										{organizations.map((org) => (
											<SelectItem
												key={org.organizationId}
												value={org.organizationId}
											>
												{org.name}
												{org.isSystem && " (管理用)"}
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
					name="role"
					render={({ field }) => (
						<FormItem>
							<FormLabel className="flex items-center gap-2">
								ロール
								<RequiredBadge />
							</FormLabel>
							<FormDescription>
								管理者は全機能利用可能。組織ユーザーは自組織関連のみ閲覧可能。
							</FormDescription>
							<FormControl>
								<RadioGroup
									defaultValue={field.value}
									disabled={disabled}
									onValueChange={field.onChange}
								>
									<div className="flex items-center gap-2">
										<RadioGroupItem id="role-admin" value={UserRole.Admin} />
										<Label htmlFor="role-admin">管理者</Label>
									</div>
									<div className="flex items-center gap-2">
										<RadioGroupItem
											id="role-org-user"
											value={UserRole.OrgUser}
										/>
										<Label htmlFor="role-org-user">組織ユーザー</Label>
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
