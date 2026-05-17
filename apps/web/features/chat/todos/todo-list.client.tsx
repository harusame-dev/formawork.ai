"use client";

import { valibotResolver } from "@hookform/resolvers/valibot";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@workspace/ui/components/card";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@workspace/ui/components/dialog";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@workspace/ui/components/form";
import { Input } from "@workspace/ui/components/input";
import { Building2, Check, CheckCircle2, Mail } from "lucide-react";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import * as v from "valibot";
import { requestConsultationAction } from "@/features/consultation/request/request-consultation.action";
import type { OrganizationCategory } from "@/features/organization-category/get-organization-categories";
import type { ChatTodo } from "./get-todos";
import { updateTodoDoneAction } from "./update-todo-done.action";

type OrganizationByCategory = {
	categoryId: string;
	description: string;
	email: string;
	organizationId: string;
	name: string;
	url: string;
};

const PHASE_LABELS: { color: string; label: string }[] = [
	{ color: "bg-indigo-100 text-indigo-900", label: "終活" },
	{ color: "bg-red-100 text-red-900", label: "緊急 (7日)" },
	{ color: "bg-orange-100 text-orange-900", label: "高 (14日)" },
	{ color: "bg-amber-100 text-amber-900", label: "中 (3ヶ月)" },
	{ color: "bg-lime-100 text-lime-900", label: "中 (4ヶ月)" },
	{ color: "bg-sky-100 text-sky-900", label: "最重要 (10ヶ月)" },
	{ color: "bg-pink-100 text-pink-900", label: "資産活用" },
];

const formSchema = v.object({
	email: v.pipe(
		v.string("メールアドレスを入力してください"),
		v.minLength(1, "メールアドレスを入力してください"),
		v.email("正しいメールアドレス形式で入力してください"),
		v.maxLength(254, "メールアドレスは254文字以内で入力してください"),
	),
});

type FormValues = v.InferOutput<typeof formSchema>;

export function TodoList({
	categories,
	chatId,
	consultedOrgIds,
	initialEmail,
	onConsulted,
	onEmailRegistered,
	onTodosRefresh,
	organizationsByCategory,
	todos,
}: {
	categories: OrganizationCategory[];
	chatId: string;
	consultedOrgIds: string[];
	initialEmail: string | null;
	onConsulted: () => void | Promise<void>;
	onEmailRegistered: (email: string) => void;
	onTodosRefresh: () => void | Promise<void>;
	organizationsByCategory: OrganizationByCategory[];
	todos: ChatTodo[];
}) {
	const [dialogTarget, setDialogTarget] = useState<{
		todoId: string;
		categoryId: string;
		organizationId: string;
		organizationName: string;
		title: string;
	} | null>(null);
	const [infoTarget, setInfoTarget] = useState<OrganizationByCategory | null>(
		null,
	);
	const [submitting, setSubmitting] = useState(false);
	const [successMessage, setSuccessMessage] = useState<string | null>(null);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [optimisticDone, setOptimisticDone] = useState<Record<string, boolean>>(
		{},
	);
	const [, startTransition] = useTransition();

	function clearOptimistic(todoId: string) {
		setOptimisticDone((prev) => {
			if (!(todoId in prev)) {
				return prev;
			}
			const { [todoId]: _omit, ...rest } = prev;
			return rest;
		});
	}

	function toggleDone(todo: ChatTodo) {
		const nextDone = !(optimisticDone[todo.todoId] ?? todo.done);
		setOptimisticDone((prev) => ({ ...prev, [todo.todoId]: nextDone }));
		startTransition(async () => {
			await updateTodoDoneAction({
				chatId,
				done: nextDone,
				todoId: todo.todoId,
			});
			// サーバー値を取り直してから optimistic をクリア（props 反映後に切替）
			await onTodosRefresh();
			clearOptimistic(todo.todoId);
		});
	}

	const form = useForm<FormValues>({
		defaultValues: { email: initialEmail ?? "" },
		resolver: valibotResolver(formSchema),
	});

	function findOrgForCategory(categoryId: string) {
		return organizationsByCategory.find((org) => org.categoryId === categoryId);
	}

	function categoryName(categoryId: string | null): string {
		if (!categoryId) {
			return "";
		}
		return categories.find((c) => c.categoryId === categoryId)?.name ?? "";
	}

	function openConsultDialog(todo: ChatTodo) {
		if (!todo.suggestedCategoryId) {
			return;
		}
		const org = findOrgForCategory(todo.suggestedCategoryId);
		if (!org) {
			return;
		}
		setDialogTarget({
			categoryId: todo.suggestedCategoryId,
			organizationId: org.organizationId,
			organizationName: org.name,
			title: todo.title,
			todoId: todo.todoId,
		});
		setErrorMessage(null);
		setSuccessMessage(null);
	}

	async function handleSubmit(values: FormValues) {
		if (!dialogTarget) {
			return;
		}
		setSubmitting(true);
		setErrorMessage(null);

		const result = await requestConsultationAction({
			chatId,
			contactEmail: initialEmail ? undefined : values.email,
			targetOrgId: dialogTarget.organizationId,
			todoId: dialogTarget.todoId,
		});

		setSubmitting(false);
		if (!result.success) {
			setErrorMessage(result.error || "相談の送信に失敗しました");
			return;
		}

		onEmailRegistered(values.email);
		await onConsulted();
		setSuccessMessage(
			`${dialogTarget.organizationName}に相談メールを送信しました。`,
		);
		setTimeout(() => {
			setDialogTarget(null);
		}, 1500);
	}

	return (
		<>
			<Card className="relative flex min-h-0 flex-col gap-0 rounded-none border-[#D7C49E]/50 bg-[#FFFDF8]/80 p-0 shadow-none backdrop-blur-sm">
				<span
					aria-hidden
					className="pointer-events-none absolute left-2 top-2 size-3 border-l border-t border-[#B89968]/50"
				/>
				<span
					aria-hidden
					className="pointer-events-none absolute right-2 top-2 size-3 border-r border-t border-[#B89968]/50"
				/>
				<span
					aria-hidden
					className="pointer-events-none absolute bottom-2 left-2 size-3 border-b border-l border-[#B89968]/50"
				/>
				<span
					aria-hidden
					className="pointer-events-none absolute bottom-2 right-2 size-3 border-b border-r border-[#B89968]/50"
				/>
				<CardHeader className="border-b border-[#D7C49E]/40 px-5 py-4">
					<div className="flex items-center gap-2">
						<span className="size-1 rounded-full bg-[#B89968]" />
						<CardTitle className="font-[family-name:var(--font-mincho)] text-sm tracking-[0.3em] text-[#2A2622]">
							こ れ か ら の こ と
						</CardTitle>
					</div>
				</CardHeader>
				<CardContent className="flex flex-1 flex-col gap-2 overflow-y-auto px-4 py-4">
					{todos.length === 0 && (
						<p className="font-[family-name:var(--font-sans-jp)] text-xs leading-relaxed text-[#5C5852]">
							会話が進むと、ここに対応すべきタスクが表示されます。
						</p>
					)}
					{todos.map((todo) => {
						const phase = PHASE_LABELS[todo.priority] ?? PHASE_LABELS[0];
						const org = todo.suggestedCategoryId
							? findOrgForCategory(todo.suggestedCategoryId)
							: undefined;
						const canConsult = !!org && !!org.email;
						const isConsulted =
							!!org && consultedOrgIds.includes(org.organizationId);
						const isDone = optimisticDone[todo.todoId] ?? todo.done;
						return (
							<div
								className={`rounded-md border p-3 flex flex-col gap-2 ${
									isDone ? "bg-muted/40 opacity-70" : ""
								}`}
								key={todo.todoId}
							>
								<div className="flex items-start gap-2">
									<label
										aria-label={isDone ? "完了を取り消す" : "完了としてマーク"}
										className={`mt-0.5 relative flex size-5 shrink-0 cursor-pointer items-center justify-center rounded border transition-colors ${
											isDone
												? "border-primary bg-primary text-primary-foreground"
												: "border-input bg-background hover:bg-accent"
										}`}
									>
										<input
											checked={isDone}
											className="sr-only"
											onChange={() => toggleDone(todo)}
											type="checkbox"
										/>
										{isDone && <Check className="size-3.5" />}
									</label>
									<div className="flex flex-1 flex-col gap-2 min-w-0">
										<div className="flex flex-wrap items-center gap-2">
											{phase && (
												<Badge className={phase.color}>{phase.label}</Badge>
											)}
											{todo.suggestedCategoryId && (
												<Badge variant="outline">
													{categoryName(todo.suggestedCategoryId)}
												</Badge>
											)}
										</div>
										<p
											className={`text-sm font-medium ${
												isDone ? "line-through" : ""
											}`}
										>
											{todo.title}
										</p>
										{todo.description && (
											<p className="text-xs text-muted-foreground whitespace-pre-wrap">
												{todo.description}
											</p>
										)}
										{canConsult &&
											!isDone &&
											(isConsulted ? (
												<Button
													disabled
													size="sm"
													type="button"
													variant="outline"
												>
													<CheckCircle2 className="size-4" />
													相談済み
												</Button>
											) : (
												<div className="flex flex-col gap-1 items-start">
													<button
														className="text-xs text-primary inline-flex items-center gap-1 underline-offset-2 hover:underline"
														onClick={() => setInfoTarget(org)}
														type="button"
													>
														<Building2 className="size-3.5" />
														相談先企業情報
													</button>
													<Button
														onClick={() => openConsultDialog(todo)}
														size="sm"
														variant="outline"
													>
														<Mail className="size-4" />
														相談する
													</Button>
													<p className="text-xs text-muted-foreground">
														クリックすると提携企業からご連絡を差し上げます
													</p>
												</div>
											))}
									</div>
								</div>
							</div>
						);
					})}
				</CardContent>
			</Card>

			<Dialog
				onOpenChange={(open) => !open && setDialogTarget(null)}
				open={dialogTarget !== null}
			>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>
							{dialogTarget?.organizationName} に相談する
						</DialogTitle>
					</DialogHeader>
					<Form {...form}>
						<form
							className="flex flex-col gap-4"
							noValidate
							onSubmit={form.handleSubmit(handleSubmit)}
						>
							<p className="text-sm text-muted-foreground">
								あなたのメールアドレスを {dialogTarget?.organizationName}
								に共有して、相談を開始します。
							</p>
							<FormField
								control={form.control}
								name="email"
								render={({ field }) => (
									<FormItem>
										<FormLabel>メールアドレス</FormLabel>
										<FormControl>
											<Input
												autoComplete="email"
												disabled={submitting || !!initialEmail}
												type="email"
												{...field}
											/>
										</FormControl>
										{initialEmail && (
											<p className="text-xs text-muted-foreground">
												登録済みのメールアドレスを使用します。
											</p>
										)}
										<FormMessage />
									</FormItem>
								)}
							/>
							{errorMessage && (
								<p className="text-sm text-destructive" role="alert">
									{errorMessage}
								</p>
							)}
							{successMessage && (
								<p className="text-sm text-emerald-700" role="status">
									{successMessage}
								</p>
							)}
							<DialogFooter>
								<Button
									disabled={submitting}
									onClick={() => setDialogTarget(null)}
									type="button"
									variant="outline"
								>
									キャンセル
								</Button>
								<Button
									disabled={submitting || successMessage !== null}
									isProcessing={submitting}
									processingLabel="送信中"
									type="submit"
								>
									相談を送信
								</Button>
							</DialogFooter>
						</form>
					</Form>
				</DialogContent>
			</Dialog>

			<Dialog
				onOpenChange={(open) => !open && setInfoTarget(null)}
				open={infoTarget !== null}
			>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>{infoTarget?.name}</DialogTitle>
					</DialogHeader>
					<div className="flex flex-col gap-3 text-sm">
						{infoTarget?.url ? (
							<div>
								<span className="text-muted-foreground">URL: </span>
								<a
									className="text-primary underline-offset-2 hover:underline break-all"
									href={infoTarget.url}
									rel="noreferrer noopener"
									target="_blank"
								>
									{infoTarget.url}
								</a>
							</div>
						) : null}
						<div>
							<div className="text-muted-foreground mb-1">会社概要</div>
							{infoTarget?.description ? (
								<p className="whitespace-pre-wrap">{infoTarget.description}</p>
							) : (
								<p className="text-muted-foreground">未登録</p>
							)}
						</div>
					</div>
					<DialogFooter>
						<Button
							onClick={() => setInfoTarget(null)}
							type="button"
							variant="outline"
						>
							閉じる
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}
