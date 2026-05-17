"use client";

import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@workspace/ui/components/sheet";
import { Loader2, Scroll, Send } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Streamdown } from "streamdown";
import type { OrganizationCategory } from "@/features/organization-category/get-organization-categories";
import type { ChatTodo } from "../todos/get-todos";
import { TodoList } from "../todos/todo-list.client";

type Message = {
	id: string;
	role: "user" | "assistant";
	content: string;
};

type OrganizationByCategory = {
	categoryId: string;
	description: string;
	email: string;
	organizationId: string;
	name: string;
	url: string;
};

export function ChatRoom({
	categories,
	chatId,
	contactEmail,
	initialConsultedOrgIds,
	initialMessages,
	initialTodos,
	organizationsByCategory,
}: {
	categories: OrganizationCategory[];
	chatId: string;
	contactEmail: string | null;
	initialConsultedOrgIds: string[];
	initialMessages: Message[];
	initialTodos: ChatTodo[];
	organizationsByCategory: OrganizationByCategory[];
}) {
	const [messages, setMessages] = useState<Message[]>(initialMessages);
	const [input, setInput] = useState("");
	const [isStreaming, setIsStreaming] = useState(false);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [todos, setTodos] = useState<ChatTodo[]>(initialTodos);
	const [storedEmail, setStoredEmail] = useState<string | null>(contactEmail);
	const [consultedOrgIds, setConsultedOrgIds] = useState<string[]>(
		initialConsultedOrgIds,
	);
	const messagesEndRef = useRef<HTMLDivElement | null>(null);
	const [isTodoSheetOpen, setIsTodoSheetOpen] = useState(false);

	const todosFingerprint = useMemo(
		() =>
			todos
				.map(
					(t) =>
						`${t.todoId}:${t.title}:${t.description ?? ""}:${t.priority}:${t.suggestedCategoryId ?? ""}`,
				)
				.join("|"),
		[todos],
	);
	const [seenFingerprint, setSeenFingerprint] = useState(todosFingerprint);
	const hasTodoUpdate = todosFingerprint !== seenFingerprint;

	function handleTodoSheetOpenChange(open: boolean) {
		setIsTodoSheetOpen(open);
		if (open) {
			setSeenFingerprint(todosFingerprint);
		}
	}

	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, []);

	const refreshTodos = useCallback(async () => {
		try {
			const todosRes = await fetch(`/api/chats/${chatId}/todos`, {
				cache: "no-store",
			});
			if (todosRes.ok) {
				const json = (await todosRes.json()) as { todos: ChatTodo[] };
				setTodos(json.todos);
			}
		} catch {
			// 失敗しても本流は止めない
		}
	}, [chatId]);

	const refreshConsultedOrgIds = useCallback(async () => {
		try {
			const res = await fetch(`/api/chats/${chatId}/consultations`, {
				cache: "no-store",
			});
			if (res.ok) {
				const json = (await res.json()) as { consultedOrgIds: string[] };
				setConsultedOrgIds(json.consultedOrgIds);
			}
		} catch {
			// 失敗しても本流は止めない
		}
	}, [chatId]);

	async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		const message = input.trim();
		if (!message || isStreaming) {
			return;
		}

		setErrorMessage(null);
		setInput("");
		const userMessageId = crypto.randomUUID();
		setMessages((prev) => [
			...prev,
			{ content: message, id: userMessageId, role: "user" },
		]);

		setIsStreaming(true);
		const assistantId = crypto.randomUUID();
		setMessages((prev) => [
			...prev,
			{ content: "", id: assistantId, role: "assistant" },
		]);

		try {
			const response = await fetch(`/api/chats/${chatId}/messages`, {
				body: JSON.stringify({ message }),
				headers: { "content-type": "application/json" },
				method: "POST",
			});

			if (!response.ok || !response.body) {
				throw new Error("ご返信の取得に失敗しました。");
			}

			const reader = response.body.getReader();
			const decoder = new TextDecoder();
			let assistantText = "";
			while (true) {
				const { done, value } = await reader.read();
				if (done) {
					break;
				}
				assistantText += decoder.decode(value, { stream: true });
				setMessages((prev) =>
					prev.map((m) =>
						m.id === assistantId ? { ...m, content: assistantText } : m,
					),
				);
			}

			await refreshTodos();
		} catch (error) {
			setErrorMessage(
				error instanceof Error ? error.message : "ご返信の取得に失敗しました。",
			);
			setMessages((prev) => prev.filter((m) => m.id !== assistantId));
		} finally {
			setIsStreaming(false);
			setTimeout(() => {
				messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
			}, 50);
		}
	}

	return (
		<div className="flex h-full min-h-0 flex-col gap-4">
			<style>{`
				@keyframes ink-fade {
					from { opacity: 0; transform: translateY(4px); filter: blur(2px); }
					to { opacity: 1; transform: translateY(0); filter: blur(0); }
				}
				@keyframes thinking-pulse {
					0%, 100% { opacity: 0.35; transform: scale(1); }
					50% { opacity: 1; transform: scale(1.15); }
				}
				.ink-message { animation: ink-fade 0.55s ease-out both; }
				.dot-1 { animation: thinking-pulse 1.2s ease-in-out infinite; }
				.dot-2 { animation: thinking-pulse 1.2s ease-in-out 0.2s infinite; }
				.dot-3 { animation: thinking-pulse 1.2s ease-in-out 0.4s infinite; }
				.chat-scroll::-webkit-scrollbar { width: 4px; }
				.chat-scroll::-webkit-scrollbar-track { background: transparent; }
				.chat-scroll::-webkit-scrollbar-thumb { background: rgba(184, 153, 104, 0.3); border-radius: 2px; }
				.chat-scroll::-webkit-scrollbar-thumb:hover { background: rgba(184, 153, 104, 0.5); }
			`}</style>

			<header className="flex shrink-0 items-center justify-between gap-3 border-b border-[#C9A961]/60 px-4 pb-3 sm:px-0">
				<div className="flex items-center gap-3">
					<span
						aria-hidden
						className="h-7 w-px bg-gradient-to-b from-transparent via-[#A07F40] to-transparent"
					/>
					<div className="flex flex-col">
						<span className="font-[family-name:var(--font-mincho)] text-[0.6rem] tracking-[0.4em] text-[#5C5852]">
							O M I O K U R I
						</span>
						<h1 className="font-[family-name:var(--font-mincho)] text-base leading-tight tracking-wider text-[#1F1B17] sm:text-lg">
							お見送りサポートチャット
						</h1>
					</div>
				</div>

				<Sheet onOpenChange={handleTodoSheetOpenChange} open={isTodoSheetOpen}>
					<SheetTrigger asChild>
						<button
							aria-label="これからのことを開く"
							className="relative inline-flex shrink-0 items-center justify-center rounded-full border border-[#C9A961]/60 bg-[#FFFDF8] p-2.5 text-[#1F1B17] transition hover:bg-[#FAF3E6] lg:hidden"
							type="button"
						>
							<Scroll className="size-4" />
							{hasTodoUpdate && (
								<span
									aria-hidden
									className="absolute -right-0.5 -top-0.5 size-2.5 rounded-full bg-[#C24A3D] ring-2 ring-[#FFFDF8]"
								/>
							)}
							{hasTodoUpdate && (
								<span className="sr-only">新しい更新があります</span>
							)}
						</button>
					</SheetTrigger>
					<SheetContent
						className="w-[88vw] max-w-[420px] border-l border-[#C9A961]/40 bg-[#FAF7F1] p-3 sm:max-w-[420px]"
						side="right"
					>
						<SheetHeader className="sr-only">
							<SheetTitle>これからのこと</SheetTitle>
						</SheetHeader>
						<div className="h-[calc(100dvh-1.5rem)] [&>div]:h-full">
							<TodoList
								categories={categories}
								chatId={chatId}
								consultedOrgIds={consultedOrgIds}
								initialEmail={storedEmail}
								onConsulted={refreshConsultedOrgIds}
								onEmailRegistered={(email) => setStoredEmail(email)}
								onTodosRefresh={refreshTodos}
								organizationsByCategory={organizationsByCategory}
								todos={todos}
							/>
						</div>
					</SheetContent>
				</Sheet>
			</header>

			<div className="flex min-h-0 flex-1 flex-col gap-4 lg:flex-row">
				<section className="relative flex min-h-0 flex-1 flex-col bg-[#FFFDF8]/80 backdrop-blur-sm">
					<div
						aria-hidden
						className="pointer-events-none absolute inset-0 border border-[#D7C49E]/40"
					/>
					<span
						aria-hidden
						className="pointer-events-none absolute left-2 top-2 size-3 border-l border-t border-[#B89968]/60"
					/>
					<span
						aria-hidden
						className="pointer-events-none absolute right-2 top-2 size-3 border-r border-t border-[#B89968]/60"
					/>
					<span
						aria-hidden
						className="pointer-events-none absolute bottom-2 left-2 size-3 border-b border-l border-[#B89968]/60"
					/>
					<span
						aria-hidden
						className="pointer-events-none absolute bottom-2 right-2 size-3 border-b border-r border-[#B89968]/60"
					/>

					<div className="relative flex min-h-0 flex-1 flex-col gap-4 px-5 py-5 sm:px-7 sm:py-6">
						<div className="chat-scroll flex flex-1 flex-col gap-5 overflow-y-auto px-1 py-2">
							{messages.length === 0 && (
								<div className="ink-message flex flex-col gap-4 self-start max-w-[88%]">
									<div className="flex items-center gap-2">
										<span className="size-1.5 rounded-full bg-[#B89968]" />
										<span className="font-[family-name:var(--font-mincho)] text-[0.68rem] tracking-[0.3em] text-[#5C5852]">
											コ ン シ ェ ル ジ ュ
										</span>
									</div>
									<div className="rounded-sm border-l-2 border-[#B89968]/60 bg-[#FAF3E6]/40 px-5 py-4 font-[family-name:var(--font-sans-jp)] text-[0.92rem] leading-[2.1] text-[#2A2622]">
										この度は、お越しくださいまして、ありがとうございます。
										<br />
										終活や、ご相続のお手続き、そしてその後の暮らしについて、
										どのようなことでもお話しください。
										<br />
										今、お心にかかっていらっしゃることから、お聞かせいただけますでしょうか。
									</div>
								</div>
							)}

							{messages.map((message) => (
								<MessageBubble
									isStreaming={isStreaming}
									key={message.id}
									message={message}
								/>
							))}
							<div ref={messagesEndRef} />
						</div>

						{errorMessage && (
							<div
								className="flex items-start gap-2 border-l-2 border-[#A24A3D] bg-[#FBEDEA]/60 px-4 py-3 text-xs text-[#A24A3D]"
								role="alert"
							>
								<span>{errorMessage}</span>
							</div>
						)}

						<form
							className="relative flex items-end gap-2 border-t border-[#D7C49E]/30 pt-4"
							onSubmit={handleSubmit}
						>
							<textarea
								className="field-sizing-content max-h-[200px] flex-1 resize-none overflow-y-auto border border-[#D7C49E]/50 bg-[#FFFDF8] px-4 py-2.5 font-[family-name:var(--font-sans-jp)] text-[0.92rem] leading-[1.9] text-[#2A2622] placeholder:text-[#A8A39A] focus:border-[#B89968] focus:outline-none focus:ring-1 focus:ring-[#B89968]/30 disabled:cursor-not-allowed disabled:opacity-60"
								disabled={isStreaming}
								onChange={(e) => setInput(e.target.value)}
								onKeyDown={(e) => {
									if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
										e.preventDefault();
										(
											e.currentTarget.form as HTMLFormElement | null
										)?.requestSubmit();
									}
								}}
								placeholder="（Cmd / Ctrl + Enter で送信）"
								rows={1}
								value={input}
							/>
							<button
								aria-label="送信"
								className="group relative inline-flex shrink-0 items-center justify-center overflow-hidden border border-[#2A2622] bg-[#2A2622] px-4 py-2.5 text-[#FAF7F1] transition-all duration-300 hover:bg-[#3A332C] disabled:cursor-not-allowed disabled:opacity-50"
								disabled={isStreaming || input.trim().length === 0}
								type="submit"
							>
								<span className="absolute inset-y-1.5 left-1.5 w-1.5 border-b border-l border-[#B89968]/60 transition-all duration-300 group-hover:w-2.5" />
								<span className="absolute inset-y-1.5 right-1.5 w-1.5 border-b border-r border-[#B89968]/60 transition-all duration-300 group-hover:w-2.5" />
								{isStreaming ? (
									<Loader2 className="size-4 animate-spin" />
								) : (
									<Send className="size-4" />
								)}
							</button>
						</form>
					</div>
				</section>

				<aside className="hidden min-h-0 flex-col gap-3 lg:flex lg:w-[360px]">
					<TodoList
						categories={categories}
						chatId={chatId}
						consultedOrgIds={consultedOrgIds}
						initialEmail={storedEmail}
						onConsulted={refreshConsultedOrgIds}
						onEmailRegistered={(email) => setStoredEmail(email)}
						onTodosRefresh={refreshTodos}
						organizationsByCategory={organizationsByCategory}
						todos={todos}
					/>
				</aside>
			</div>
		</div>
	);
}

function MessageBubble({
	isStreaming,
	message,
}: {
	isStreaming: boolean;
	message: Message;
}) {
	if (message.role === "user") {
		return (
			<div className="ink-message flex flex-col items-end gap-1.5 self-end max-w-[82%]">
				<span className="font-[family-name:var(--font-mincho)] text-[0.6rem] tracking-[0.3em] text-[#5C5852]">
					あ な た
				</span>
				<div className="whitespace-pre-wrap rounded-sm bg-[#5B7B8B] px-5 py-3 font-[family-name:var(--font-sans-jp)] text-[0.92rem] leading-[1.9] text-[#FAF7F1] shadow-[0_1px_0_rgba(91,123,139,0.4)]">
					{message.content}
				</div>
			</div>
		);
	}

	const showThinking = !message.content && isStreaming;

	return (
		<div className="ink-message flex flex-col gap-1.5 self-start max-w-[88%]">
			<div className="flex items-center gap-2">
				<span className="size-1.5 rounded-full bg-[#B89968]" />
				<span className="font-[family-name:var(--font-mincho)] text-[0.6rem] tracking-[0.3em] text-[#5C5852]">
					コ ン シ ェ ル ジ ュ
				</span>
			</div>
			<div className="rounded-sm border-l-2 border-[#B89968]/60 bg-[#FAF3E6]/40 px-5 py-3 font-[family-name:var(--font-sans-jp)] text-[0.92rem] leading-[2.0] text-[#2A2622]">
				{showThinking ? (
					<span className="inline-flex items-center gap-1.5 text-[#3A3530]">
						<span>お言葉を、お受けしております</span>
						<span className="dot-1 size-1 rounded-full bg-[#B89968]" />
						<span className="dot-2 size-1 rounded-full bg-[#B89968]" />
						<span className="dot-3 size-1 rounded-full bg-[#B89968]" />
					</span>
				) : message.content ? (
					<div className="prose prose-sm max-w-none prose-p:my-2 prose-headings:my-3 prose-headings:font-[family-name:var(--font-mincho)] prose-strong:text-[#2A2622] prose-a:text-[#5B7B8B]">
						<Streamdown>{message.content}</Streamdown>
					</div>
				) : (
					""
				)}
			</div>
		</div>
	);
}
