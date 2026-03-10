"use client";

import { valibotResolver } from "@hookform/resolvers/valibot";
import {
	MEMORY_CATEGORY_LABEL,
	MemoryCategory,
} from "@workspace/db/schema/customer-memory";
import { Button } from "@workspace/ui/components/button";
import { DialogFooter } from "@workspace/ui/components/dialog";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { RequiredBadge } from "@workspace/ui/components/required-badge";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@workspace/ui/components/select";
import { Textarea } from "@workspace/ui/components/textarea";
import { AlertCircle } from "lucide-react";
import { useId, useState, useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import * as v from "valibot";
import {
	MEMORY_CATEGORY_MAX,
	MEMORY_CATEGORY_MIN,
	MEMORY_CONTENT_MAX_LENGTH,
	MEMORY_IMPORTANCE_MAX,
	MEMORY_IMPORTANCE_MIN,
} from "./customer-memory";
import { editCustomerMemoryAction } from "./edit/edit-customer-memory.action";
import { registerCustomerMemoryAction } from "./register/register-customer-memory.action";

const MEMORY_CATEGORY_DEFAULT = MemoryCategory.Personal;
const MEMORY_IMPORTANCE_DEFAULT = 5;

const memoryFormSchema = v.object({
	category: v.pipe(
		v.string(),
		v.minLength(1, "カテゴリを選択してください"),
		v.transform((val) => Number(val)),
		v.minValue(MEMORY_CATEGORY_MIN, "カテゴリを選択してください"),
		v.maxValue(MEMORY_CATEGORY_MAX, "無効なカテゴリです"),
	),
	content: v.pipe(
		v.string(),
		v.minLength(1, "内容を入力してください"),
		v.maxLength(
			MEMORY_CONTENT_MAX_LENGTH,
			`内容は${MEMORY_CONTENT_MAX_LENGTH}文字以内で入力してください`,
		),
	),
	importance: v.pipe(
		v.string(),
		v.transform((val) => Number(val)),
		v.minValue(
			MEMORY_IMPORTANCE_MIN,
			`重要度は${MEMORY_IMPORTANCE_MIN}以上で入力してください`,
		),
		v.maxValue(
			MEMORY_IMPORTANCE_MAX,
			`重要度は${MEMORY_IMPORTANCE_MAX}以下で入力してください`,
		),
	),
});

type MemoryFormValues = v.InferOutput<typeof memoryFormSchema>;
type MemoryFormInput = v.InferInput<typeof memoryFormSchema>;

const categoryOptions = Object.entries(MemoryCategory).map(([, value]) => ({
	label: MEMORY_CATEGORY_LABEL[value as MemoryCategory],
	value: String(value),
}));

const INITIAL_VALUES: MemoryFormInput = {
	category: String(MEMORY_CATEGORY_DEFAULT),
	content: "",
	importance: String(MEMORY_IMPORTANCE_DEFAULT),
};

type CustomerMemoryEditFormProps = {
	customerId: string;
	defaultValues?: MemoryFormInput;
	memoryId?: string;
	onCancel: () => void;
	onSuccess: () => void;
};

export function CustomerMemoryEditForm({
	customerId,
	defaultValues,
	memoryId,
	onCancel,
	onSuccess,
}: CustomerMemoryEditFormProps) {
	const isEditMode = memoryId !== undefined;
	const submitLabel = isEditMode ? "更新" : "登録";
	const processingLabel = isEditMode ? "更新中" : "登録中";
	const [isPending, startTransition] = useTransition();
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const categoryId = useId();
	const contentId = useId();
	const importanceId = useId();

	const {
		control,
		formState: { errors },
		handleSubmit,
		register,
	} = useForm<MemoryFormInput, unknown, MemoryFormValues>({
		defaultValues: defaultValues ?? INITIAL_VALUES,
		resolver: valibotResolver(memoryFormSchema),
	});

	function handleFormSubmit(values: MemoryFormValues) {
		setErrorMessage(null);

		startTransition(async () => {
			const result = isEditMode
				? await editCustomerMemoryAction({
						category: values.category,
						content: values.content,
						customerId,
						importance: values.importance,
						memoryId,
					})
				: await registerCustomerMemoryAction({
						category: values.category,
						content: values.content,
						customerId,
						importance: values.importance,
					});

			if (!result.success) {
				setErrorMessage(result.error);
				return;
			}

			setErrorMessage(null);
			onSuccess();
		});
	}

	return (
		<form className="space-y-4" onSubmit={handleSubmit(handleFormSubmit)}>
			{errorMessage && (
				<div className="bg-destructive/10 text-destructive flex items-center gap-2 rounded-md p-3 text-sm">
					<AlertCircle className="h-4 w-4 shrink-0" />
					<p>{errorMessage}</p>
				</div>
			)}

			<div className="space-y-2">
				<Label className="flex items-center gap-2" htmlFor={categoryId}>
					カテゴリ
					<RequiredBadge />
				</Label>
				<p className="text-muted-foreground text-sm">
					メモリの分類を選択してください
				</p>
				<Controller
					control={control}
					name="category"
					render={({ field }) => (
						<Select
							disabled={isPending}
							onValueChange={field.onChange}
							value={field.value}
						>
							<SelectTrigger className="w-full" id={categoryId}>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{categoryOptions.map((option) => (
									<SelectItem key={option.value} value={option.value}>
										{option.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					)}
				/>
				{errors.category && (
					<p className="text-destructive text-sm">{errors.category.message}</p>
				)}
			</div>

			<div className="space-y-2">
				<Label className="flex items-center gap-2" htmlFor={contentId}>
					内容
					<RequiredBadge />
				</Label>
				<p className="text-muted-foreground text-sm">
					顧客に関する重要な情報を記録できます
				</p>
				<Textarea
					{...register("content")}
					className="max-h-32"
					disabled={isPending}
					id={contentId}
					maxLength={MEMORY_CONTENT_MAX_LENGTH}
				/>
				{errors.content && (
					<p className="text-destructive text-sm">{errors.content.message}</p>
				)}
			</div>

			<div className="space-y-2">
				<Label className="flex items-center gap-2" htmlFor={importanceId}>
					重要度
					<RequiredBadge />
				</Label>
				<p className="text-muted-foreground text-sm">
					{MEMORY_IMPORTANCE_MIN}（低）〜{MEMORY_IMPORTANCE_MAX}
					（高）で重要度を設定できます
				</p>
				<Input
					{...register("importance")}
					className="w-20"
					disabled={isPending}
					id={importanceId}
					max={MEMORY_IMPORTANCE_MAX}
					min={MEMORY_IMPORTANCE_MIN}
					type="number"
				/>
				{errors.importance && (
					<p className="text-destructive text-sm">
						{errors.importance.message}
					</p>
				)}
			</div>

			<DialogFooter>
				<Button
					disabled={isPending}
					onClick={onCancel}
					type="button"
					variant="outline"
				>
					キャンセル
				</Button>
				<Button
					className="min-w-[120px]"
					isProcessing={isPending}
					processingLabel={processingLabel}
					type="submit"
				>
					{submitLabel}
				</Button>
			</DialogFooter>
		</form>
	);
}
