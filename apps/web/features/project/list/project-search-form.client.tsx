"use client";

import { valibotResolver } from "@hookform/resolvers/valibot";
import { Button } from "@workspace/ui/components/button";
import { Checkbox } from "@workspace/ui/components/checkbox";
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
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@workspace/ui/components/select";
import { Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import * as v from "valibot";
import type { UserOption } from "@/features/user/list/get-user-options";
import { useIsHydrated } from "@/libs/use-is-hydrated.hook";

// Radix UI Select v2 では空文字列の value が禁止されているためセンチネル値を使用
const ALL_ASSIGNEE_VALUE = "__all__";

const formSchema = v.object({
	assigneeId: v.optional(v.string()),
	includeArchived: v.optional(v.boolean()),
	keyword: v.optional(v.pipe(v.string(), v.maxLength(300))),
});

type FormValues = v.InferOutput<typeof formSchema>;

type ProjectSearchFormProps = {
	assigneeOptions: UserOption[];
	condition: {
		assigneeId?: string;
		includeArchived?: boolean;
		keyword?: string;
	};
};

export function ProjectSearchForm({
	assigneeOptions,
	condition,
}: ProjectSearchFormProps) {
	const router = useRouter();
	const { isHydrated } = useIsHydrated();

	const form = useForm<FormValues>({
		defaultValues: {
			assigneeId: condition.assigneeId ?? "",
			includeArchived: condition.includeArchived ?? false,
			keyword: condition.keyword ?? "",
		},
		resolver: valibotResolver(formSchema),
	});

	function onSubmit({ assigneeId, includeArchived, keyword }: FormValues) {
		const params = new URLSearchParams();
		if (keyword) {
			params.set("keyword", keyword);
		}
		if (assigneeId) {
			params.set("assigneeId", assigneeId);
		}
		if (includeArchived) {
			params.set("includeArchived", "true");
		}

		router.push(`/projects?${params}`);
	}

	function handleReset() {
		form.reset({ assigneeId: "", includeArchived: false, keyword: "" });
		router.push("/projects");
	}

	const disabled = !isHydrated;

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
							<FormLabel>プロジェクト名</FormLabel>
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
					name="assigneeId"
					render={({ field }) => (
						<FormItem>
							<FormLabel>担当者</FormLabel>
							<div className="overflow-hidden">
								<Select
									disabled={disabled}
									onValueChange={(value) =>
										field.onChange(value === ALL_ASSIGNEE_VALUE ? "" : value)
									}
									value={field.value || ALL_ASSIGNEE_VALUE}
								>
									<FormControl>
										<SelectTrigger className="w-40">
											<SelectValue placeholder="すべて" />
										</SelectTrigger>
									</FormControl>
									<SelectContent>
										<SelectItem value={ALL_ASSIGNEE_VALUE}>すべて</SelectItem>
										{assigneeOptions.map((option) => (
											<SelectItem key={option.userId} value={option.userId}>
												{option.fullName}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="includeArchived"
					render={({ field }) => (
						<FormItem className="flex items-center gap-2 space-y-0">
							<FormControl>
								<Checkbox
									checked={field.value ?? false}
									disabled={disabled}
									id="includeArchived"
									onCheckedChange={field.onChange}
								/>
							</FormControl>
							<FormLabel
								className="cursor-pointer font-normal"
								htmlFor="includeArchived"
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
