"use client";

import { valibotResolver } from "@hookform/resolvers/valibot";
import { Button } from "@workspace/ui/components/button";
import { Checkbox } from "@workspace/ui/components/checkbox";
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
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import type * as v from "valibot";
import { useIsHydrated } from "@/libs/use-is-hydrated.hook";
import { createVolunteerAction } from "../actions/create-volunteer.action";
import { createVolunteerSchema, GENDER_OPTIONS } from "../actions/schema";
import { updateVolunteerAction } from "../actions/update-volunteer.action";

type VolunteerFormProps =
	| {
			eventId: string;
			eventDates: string[];
			volunteerId?: undefined;
			initialValues?: undefined;
	  }
	| {
			eventId: string;
			eventDates: string[];
			volunteerId: string;
			initialValues: {
				code: string;
				gender: string | null;
				name: string;
				participationDates: string[];
			};
	  };

const formSchema = createVolunteerSchema;
type FormValues = v.InferOutput<typeof formSchema>;

function formatDate(date: string): string {
	const [year, month, day] = date.split("-");
	return `${year}年${month}月${day}日`;
}

export function VolunteerForm({
	eventId,
	eventDates,
	volunteerId,
	initialValues,
}: VolunteerFormProps) {
	const router = useRouter();
	const { isHydrated } = useIsHydrated();
	const isEditMode = !!volunteerId;

	const form = useForm<FormValues>({
		defaultValues: isEditMode
			? {
					code: initialValues.code,
					eventId,
					gender:
						(initialValues.gender as
							| (typeof GENDER_OPTIONS)[number]
							| undefined) ?? undefined,
					name: initialValues.name,
					participationDates: initialValues.participationDates,
				}
			: {
					code: "",
					eventId,
					gender: undefined,
					name: "",
					participationDates: [],
				},
		resolver: valibotResolver(formSchema),
	});

	async function onSubmit(values: FormValues) {
		form.clearErrors("root");

		if (isEditMode) {
			const result = await updateVolunteerAction({
				...values,
				volunteerId,
			});

			if (!result.success) {
				form.setError("root", {
					message: result.error ?? "エラーが発生しました",
				});
			}
		} else {
			const result = await createVolunteerAction(values);

			if (!result.success) {
				form.setError("root", {
					message: result.error ?? "エラーが発生しました",
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
								氏名
								<RequiredBadge />
							</FormLabel>
							<FormDescription>100文字以内で入力してください</FormDescription>
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
					name="code"
					render={({ field }) => (
						<FormItem>
							<FormLabel className="flex items-center gap-2">
								ID
								<RequiredBadge />
							</FormLabel>
							<FormDescription>
								数字6桁で入力してください（イベント内で一意）
							</FormDescription>
							<FormControl>
								<Input
									className="max-w-[120px]"
									disabled={disabled}
									maxLength={6}
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
					name="gender"
					render={({ field }) => (
						<FormItem>
							<FormLabel className="flex items-center gap-2">
								性別
								<OptionalBadge />
							</FormLabel>
							<Select
								disabled={disabled}
								onValueChange={field.onChange}
								value={field.value}
							>
								<FormControl>
									<SelectTrigger className="max-w-[160px]">
										<SelectValue />
									</SelectTrigger>
								</FormControl>
								<SelectContent>
									{GENDER_OPTIONS.map((gender) => (
										<SelectItem key={gender} value={gender}>
											{gender}
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
					name="participationDates"
					render={() => (
						<FormItem>
							<FormLabel className="flex items-center gap-2">
								参加予定日
								<RequiredBadge />
							</FormLabel>
							<FormDescription>
								イベント開催日から選択してください
							</FormDescription>
							<div className="flex flex-col gap-2">
								{eventDates.map((date) => (
									<FormField
										control={form.control}
										key={date}
										name="participationDates"
										render={({ field }) => (
											<FormItem className="flex flex-row items-center gap-2 space-y-0">
												<FormControl>
													<Checkbox
														checked={field.value?.includes(date)}
														disabled={disabled}
														onCheckedChange={(checked) => {
															if (checked) {
																field.onChange([...(field.value ?? []), date]);
															} else {
																field.onChange(
																	(field.value ?? []).filter((d) => d !== date),
																);
															}
														}}
													/>
												</FormControl>
												<FormLabel className="font-normal">
													{formatDate(date)}
												</FormLabel>
											</FormItem>
										)}
									/>
								))}
							</div>
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
						processingLabel={isEditMode ? "更新中" : "登録中"}
						type="submit"
					>
						{isEditMode ? "更新する" : "登録する"}
					</Button>
				</div>
			</form>
		</Form>
	);
}
