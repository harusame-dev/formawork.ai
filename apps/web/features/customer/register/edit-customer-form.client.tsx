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
import {
	RadioGroup,
	RadioGroupItem,
} from "@workspace/ui/components/radio-group";
import { RequiredBadge } from "@workspace/ui/components/required-badge";
import { Textarea } from "@workspace/ui/components/textarea";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { editCustomerAction } from "@/features/customer/edit/edit-customer.action";
import { useIsHydrated } from "@/libs/is-hydrated.hook";
import type { EditCustomerParams } from "../edit/schema";
import { GENDER_LABELS, Gender } from "../schema";
import { registerCustomerAction } from "./register-customer.action";
import { type RegisterCustomerParams, registerCustomerSchema } from "./schema";

type EditCustomerFormProps = {
	customerId?: string;
	initialValues?: Omit<EditCustomerParams, "customerId">;
};

export function EditCustomerForm(
	props?: EditCustomerFormProps & { disabled?: boolean },
) {
	const router = useRouter();
	const { isHydrated } = useIsHydrated();

	const form = useForm<RegisterCustomerParams>({
		defaultValues: props?.initialValues
			? props.initialValues
			: {
					address: "",
					birthDate: "",
					email: "",
					firstName: "",
					firstNameKana: "",
					gender: Gender.Male,
					lastName: "",
					lastNameKana: "",
					phone: "",
					remarks: "",
				},
		resolver: valibotResolver(registerCustomerSchema),
	});

	async function onSubmit(values: RegisterCustomerParams) {
		form.clearErrors("root");

		const result = props?.customerId
			? await editCustomerAction({
					customerId: props.customerId,
					...values,
				})
			: await registerCustomerAction(values);

		if (!result.success) {
			form.setError("root", {
				message: result?.error || "エラーが発生しました",
			});
		}
	}

	const disabled = !!(
		form.formState.isSubmitting ||
		!isHydrated ||
		props?.disabled
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
					name="lastNameKana"
					render={({ field }) => (
						<FormItem>
							<FormLabel className="flex items-center gap-2">
								姓（かな）
								<OptionalBadge />
							</FormLabel>
							<FormDescription>ひらがなで入力してください</FormDescription>
							<FormControl>
								<Input
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
					name="firstNameKana"
					render={({ field }) => (
						<FormItem>
							<FormLabel className="flex items-center gap-2">
								名（かな）
								<OptionalBadge />
							</FormLabel>
							<FormDescription>ひらがなで入力してください</FormDescription>
							<FormControl>
								<Input
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
								<OptionalBadge />
							</FormLabel>
							<FormDescription>254文字以内で入力してください</FormDescription>
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
				<FormField
					control={form.control}
					name="phone"
					render={({ field }) => (
						<FormItem>
							<FormLabel className="flex items-center gap-2">
								電話番号
								<OptionalBadge />
							</FormLabel>
							<FormDescription>
								数字のみ20文字以内で入力してください（ハイフンは自動で除去されます）
							</FormDescription>
							<FormControl>
								<Input
									autoComplete="tel"
									className="w-40"
									disabled={disabled}
									type="tel"
									{...field}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="address"
					render={({ field }) => (
						<FormItem>
							<FormLabel className="flex items-center gap-2">
								住所
								<OptionalBadge />
							</FormLabel>
							<FormDescription>200文字以内で入力してください</FormDescription>
							<FormControl>
								<Input
									autoComplete="street-address"
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
					name="birthDate"
					render={({ field }) => (
						<FormItem>
							<FormLabel className="flex items-center gap-2">
								生年月日
								<OptionalBadge />
							</FormLabel>
							<FormControl>
								<Input
									autoComplete="bday"
									className="w-40"
									disabled={disabled}
									type="date"
									{...field}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="gender"
					render={({ field }) => (
						<FormItem>
							<FormLabel className="flex items-center gap-2">
								性別
								<RequiredBadge />
							</FormLabel>
							<FormControl>
								<RadioGroup
									className="flex flex-wrap gap-4"
									defaultValue={String(field.value)}
									disabled={disabled}
									onValueChange={(value) => field.onChange(Number(value))}
								>
									{(
										[
											Gender.Unknown,
											Gender.Male,
											Gender.Female,
											Gender.NotApplicable,
										] as const
									).map((genderValue) => (
										<div className="flex items-center gap-2" key={genderValue}>
											<RadioGroupItem
												id={`gender-${genderValue}`}
												value={String(genderValue)}
											/>
											<label
												className="cursor-pointer"
												htmlFor={`gender-${genderValue}`}
											>
												{GENDER_LABELS[genderValue]}
											</label>
										</div>
									))}
								</RadioGroup>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="remarks"
					render={({ field }) => (
						<FormItem>
							<FormLabel className="flex items-center gap-2">
								備考
								<OptionalBadge />
							</FormLabel>
							<FormDescription>4096文字以内で入力してください</FormDescription>
							<FormControl>
								<Textarea
									className="min-h-[100px]"
									disabled={disabled}
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
					{props?.customerId ? (
						<Button
							className="min-w-[120px]"
							disabled={disabled}
							isProcessing={form.formState.isSubmitting}
							processingLabel="編集中"
							type="submit"
						>
							編集する
						</Button>
					) : (
						<Button
							className="min-w-[120px]"
							disabled={disabled}
							isProcessing={form.formState.isSubmitting}
							processingLabel="登録中"
							type="submit"
						>
							登録する
						</Button>
					)}
				</div>
			</form>
		</Form>
	);
}
