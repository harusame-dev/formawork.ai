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
import { Textarea } from "@workspace/ui/components/textarea";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { useIsHydrated } from "@/libs/use-is-hydrated.hook";
import { createEventAction } from "../actions/create-event.action";
import { type EventFormParams, eventFormSchema } from "../actions/schema";
import { updateEventAction } from "../actions/update-event.action";

type CreateMode = {
	mode: "create";
	defaultValues?: Partial<EventFormParams>;
};

type EditMode = {
	mode: "edit";
	eventId: string;
	defaultValues: EventFormParams;
};

type EventFormProps = CreateMode | EditMode;

export function EventForm(props: EventFormProps) {
	const router = useRouter();
	const [isPending, startTransition] = useTransition();
	const { isHydrated } = useIsHydrated();

	const form = useForm<EventFormParams>({
		defaultValues: props.defaultValues ?? {
			description: "",
			eventDates: [],
			name: "",
		},
		resolver: valibotResolver(eventFormSchema),
	});

	const isDisabled = isPending || !isHydrated;
	const eventDates = form.watch("eventDates");

	function addDate(dateStr: string) {
		if (!dateStr) return;
		const current = form.getValues("eventDates");
		if (current.includes(dateStr)) return;
		form.setValue("eventDates", [...current, dateStr].sort(), {
			shouldValidate: true,
		});
	}

	function removeDate(dateStr: string) {
		const current = form.getValues("eventDates");
		form.setValue(
			"eventDates",
			current.filter((d) => d !== dateStr),
			{ shouldValidate: true },
		);
	}

	function onSubmit(values: EventFormParams) {
		form.clearErrors("root");
		startTransition(async () => {
			let result: { success: boolean; error?: string };
			if (props.mode === "edit") {
				result = await updateEventAction({
					...values,
					eventId: props.eventId,
				});
			} else {
				result = await createEventAction(values);
			}
			if (!result.success) {
				form.setError("root", {
					message: result.error,
				});
			}
		});
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
					disabled={isDisabled}
					name="name"
					render={({ field }) => (
						<FormItem>
							<FormLabel>
								イベント名
								<span className="ml-1 text-destructive">*</span>
							</FormLabel>
							<FormDescription>100文字以内で入力してください</FormDescription>
							<FormControl>
								<Input className="max-w-md" {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="eventDates"
					render={() => (
						<FormItem>
							<FormLabel>
								開催日
								<span className="ml-1 text-destructive">*</span>
							</FormLabel>
							<FormDescription>
								開催日を選択してください（複数選択可）
							</FormDescription>
							<FormControl>
								<Input
									className="max-w-xs"
									disabled={isDisabled}
									onChange={(e) => {
										const val = e.target.value;
										if (val) {
											addDate(val);
											e.target.value = "";
										}
									}}
									type="date"
								/>
							</FormControl>
							{eventDates.length > 0 && (
								<div className="mt-2 flex flex-wrap gap-2">
									{eventDates.map((date) => (
										<div
											className="flex items-center gap-1 rounded-md border bg-muted px-2 py-1 text-sm"
											key={date}
										>
											<span>{date.replace(/-/g, "/")}</span>
											<button
												className="ml-1 text-muted-foreground hover:text-destructive"
												disabled={isDisabled}
												onClick={() => removeDate(date)}
												type="button"
											>
												×
											</button>
										</div>
									))}
								</div>
							)}
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					disabled={isDisabled}
					name="description"
					render={({ field }) => (
						<FormItem>
							<FormLabel>詳細説明</FormLabel>
							<FormDescription>
								イベントの詳細を入力してください（任意）
							</FormDescription>
							<FormControl>
								<Textarea
									className="max-w-md"
									rows={5}
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
						disabled={isDisabled}
						onClick={() => router.back()}
						type="button"
						variant="outline"
					>
						キャンセル
					</Button>
					<Button
						disabled={isDisabled}
						isProcessing={isPending}
						processingLabel={props.mode === "edit" ? "更新中" : "作成中"}
						type="submit"
					>
						{props.mode === "edit" ? "更新" : "作成"}
					</Button>
				</div>
			</form>
		</Form>
	);
}
