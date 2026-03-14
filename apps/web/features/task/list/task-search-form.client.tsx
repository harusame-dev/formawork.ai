"use client";

import { valibotResolver } from "@hookform/resolvers/valibot";
import { Button } from "@workspace/ui/components/button";
import { Checkbox } from "@workspace/ui/components/checkbox";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@workspace/ui/components/command";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@workspace/ui/components/form";
import { Input } from "@workspace/ui/components/input";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@workspace/ui/components/popover";
import { ChevronDown, Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import type * as v from "valibot";
import { TaskStatusLabel } from "@/features/task/status";
import type { UserOption } from "@/features/user/list/get-user-options";
import { useIsHydrated } from "@/libs/use-is-hydrated.hook";
import type { ProjectOption } from "./get-project-options";
import type { TasksCondition } from "./schema";
import { tasksConditionSchema } from "./schema";

type FormValues = v.InferOutput<typeof tasksConditionSchema>;

type TaskSearchFormProps = {
	assigneeOptions: UserOption[];
	condition: TasksCondition;
	projectOptions: ProjectOption[];
};

type MultiSelectOption = {
	label: string;
	value: string;
};

function MultiSelectComboBox({
	disabled,
	label,
	onChange,
	options,
	value,
}: {
	disabled?: boolean;
	label: string;
	onChange: (values: string[]) => void;
	options: MultiSelectOption[];
	value: string[];
}) {
	const selectedLabels = options
		.filter((opt) => value.includes(opt.value))
		.map((opt) => opt.label);

	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button
					className="w-44 justify-between font-normal"
					disabled={disabled}
					role="combobox"
					type="button"
					variant="outline"
				>
					<span className="truncate text-left">
						{selectedLabels.length > 0 ? selectedLabels.join(", ") : "すべて"}
					</span>
					<ChevronDown className="h-4 w-4 opacity-50 shrink-0 ml-2" />
				</Button>
			</PopoverTrigger>
			<PopoverContent align="start" className="w-44 p-0">
				<Command>
					<CommandInput placeholder={`${label}を検索...`} />
					<CommandList>
						<CommandEmpty>見つかりません</CommandEmpty>
						<CommandGroup>
							{options.map((option) => (
								<CommandItem
									key={option.value}
									onSelect={() => {
										const next = value.includes(option.value)
											? value.filter((v) => v !== option.value)
											: [...value, option.value];
										onChange(next);
									}}
								>
									<Checkbox
										checked={value.includes(option.value)}
										className="mr-2"
									/>
									{option.label}
								</CommandItem>
							))}
						</CommandGroup>
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	);
}

const STATUS_OPTIONS: MultiSelectOption[] = [
	{ label: TaskStatusLabel.todo, value: "todo" },
	{ label: TaskStatusLabel.in_progress, value: "in_progress" },
	{ label: TaskStatusLabel.done, value: "done" },
];

export function TaskSearchForm({
	assigneeOptions,
	condition,
	projectOptions,
}: TaskSearchFormProps) {
	const router = useRouter();
	const { isHydrated } = useIsHydrated();

	const form = useForm<FormValues>({
		defaultValues: {
			assigneeIds: condition.assigneeIds ?? [],
			dueDateFrom: condition.dueDateFrom ?? "",
			dueDateTo: condition.dueDateTo ?? "",
			includeArchived: condition.includeArchived ?? false,
			keyword: condition.keyword ?? "",
			projectIds: condition.projectIds ?? [],
			statuses: condition.statuses ?? [],
		},
		resolver: valibotResolver(tasksConditionSchema),
	});

	function onSubmit(data: FormValues) {
		const params = new URLSearchParams();
		if (data.keyword) {
			params.set("keyword", data.keyword);
		}
		if (data.dueDateFrom) {
			params.set("dueDateFrom", data.dueDateFrom);
		}
		if (data.dueDateTo) {
			params.set("dueDateTo", data.dueDateTo);
		}
		for (const id of data.projectIds ?? []) {
			params.append("projectIds", id);
		}
		for (const status of data.statuses ?? []) {
			params.append("statuses", status);
		}
		for (const id of data.assigneeIds ?? []) {
			params.append("assigneeIds", id);
		}
		if (data.includeArchived) {
			params.set("includeArchived", "true");
		}
		router.push(`/tasks?${params}`);
	}

	function handleReset() {
		form.reset({
			assigneeIds: [],
			dueDateFrom: "",
			dueDateTo: "",
			includeArchived: false,
			keyword: "",
			projectIds: [],
			statuses: [],
		});
		router.push("/tasks");
	}

	const disabled = !isHydrated;

	const projectOptionList: MultiSelectOption[] = projectOptions.map((p) => ({
		label: p.name,
		value: p.projectId,
	}));

	const assigneeOptionList: MultiSelectOption[] = assigneeOptions.map((u) => ({
		label: u.fullName,
		value: u.userId,
	}));

	return (
		<Form {...form}>
			<form
				className="flex flex-wrap gap-4 items-end"
				onSubmit={form.handleSubmit(onSubmit)}
			>
				<FormField
					control={form.control}
					name="keyword"
					render={({ field }) => (
						<FormItem>
							<FormLabel>タスク名</FormLabel>
							<FormControl>
								<Input
									{...field}
									className="w-48"
									disabled={disabled}
									type="text"
									value={field.value ?? ""}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="projectIds"
					render={({ field }) => (
						<FormItem>
							<FormLabel>プロジェクト</FormLabel>
							<FormControl>
								<MultiSelectComboBox
									disabled={disabled}
									label="プロジェクト"
									onChange={field.onChange}
									options={projectOptionList}
									value={field.value ?? []}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="statuses"
					render={({ field }) => (
						<FormItem>
							<FormLabel>ステータス</FormLabel>
							<FormControl>
								<MultiSelectComboBox
									disabled={disabled}
									label="ステータス"
									onChange={(vals) =>
										field.onChange(
											vals as Array<"todo" | "in_progress" | "done">,
										)
									}
									options={STATUS_OPTIONS}
									value={field.value ?? []}
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
								<MultiSelectComboBox
									disabled={disabled}
									label="担当者"
									onChange={field.onChange}
									options={assigneeOptionList}
									value={field.value ?? []}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<div className="flex gap-2 items-end">
					<FormField
						control={form.control}
						name="dueDateFrom"
						render={({ field }) => (
							<FormItem>
								<FormLabel>期限（開始）</FormLabel>
								<FormControl>
									<Input
										{...field}
										className="w-36"
										disabled={disabled}
										type="date"
										value={field.value ?? ""}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<span className="pb-2 text-muted-foreground">〜</span>
					<FormField
						control={form.control}
						name="dueDateTo"
						render={({ field }) => (
							<FormItem>
								<FormLabel>期限（終了）</FormLabel>
								<FormControl>
									<Input
										{...field}
										className="w-36"
										disabled={disabled}
										type="date"
										value={field.value ?? ""}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				</div>

				<FormField
					control={form.control}
					name="includeArchived"
					render={({ field }) => (
						<FormItem className="flex items-center gap-2 space-y-0">
							<FormControl>
								<Checkbox
									checked={field.value ?? false}
									disabled={disabled}
									id="taskIncludeArchived"
									onCheckedChange={field.onChange}
								/>
							</FormControl>
							<FormLabel
								className="cursor-pointer font-normal"
								htmlFor="taskIncludeArchived"
							>
								アーカイブも表示
							</FormLabel>
						</FormItem>
					)}
				/>

				<div className="flex gap-2 w-full">
					<Button disabled={disabled} type="submit">
						<Search className="h-4 w-4 mr-2" />
						検索
					</Button>
					<Button
						disabled={disabled}
						onClick={handleReset}
						type="button"
						variant="outline"
					>
						<X className="h-4 w-4 mr-2" />
						リセット
					</Button>
				</div>
			</form>
		</Form>
	);
}
