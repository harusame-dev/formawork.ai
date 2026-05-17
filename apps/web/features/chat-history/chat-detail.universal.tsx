import { Badge } from "@workspace/ui/components/badge";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@workspace/ui/components/card";
import { Streamdown } from "streamdown";
import type { ChatMessage } from "@/features/chat/messages/get-messages";
import type { ChatTodo } from "@/features/chat/todos/get-todos";

export function ChatDetailPresenter({
	messages,
	relevantCategoryId,
	todos,
}: {
	messages: ChatMessage[];
	relevantCategoryId: string | null;
	todos: ChatTodo[];
}) {
	return (
		<div className="flex flex-col gap-4 lg:flex-row">
			<Card className="flex-1">
				<CardHeader>
					<CardTitle className="text-base">会話履歴</CardTitle>
				</CardHeader>
				<CardContent className="flex flex-col gap-3">
					{messages.length === 0 && (
						<p className="text-sm text-muted-foreground">
							まだメッセージがありません
						</p>
					)}
					{messages.map((message) => (
						<div
							className={
								message.role === "user"
									? "self-end max-w-[80%] rounded-lg bg-primary text-primary-foreground px-3 py-2 whitespace-pre-wrap"
									: "self-start max-w-[85%] rounded-lg bg-muted px-3 py-2"
							}
							key={message.messageId}
						>
							{message.role === "assistant" ? (
								<div className="prose prose-sm max-w-none dark:prose-invert prose-p:my-2 prose-headings:my-3">
									<Streamdown>{message.content}</Streamdown>
								</div>
							) : (
								<span className="whitespace-pre-wrap">{message.content}</span>
							)}
						</div>
					))}
				</CardContent>
			</Card>
			<Card className="lg:w-[320px]">
				<CardHeader>
					<CardTitle className="text-base">抽出された TODO</CardTitle>
				</CardHeader>
				<CardContent className="flex flex-col gap-2">
					{todos.length === 0 && (
						<p className="text-sm text-muted-foreground">なし</p>
					)}
					{todos.map((todo) => {
						const isRelevant =
							relevantCategoryId !== null &&
							todo.suggestedCategoryId === relevantCategoryId;
						return (
							<div
								className={
									isRelevant
										? "rounded-md border border-primary bg-primary/5 p-2 text-sm"
										: "rounded-md border p-2 text-sm"
								}
								key={todo.todoId}
							>
								<div className="flex items-start justify-between gap-2">
									<p
										className={
											todo.done
												? "font-medium line-through text-muted-foreground"
												: "font-medium"
										}
									>
										{todo.title}
									</p>
									<div className="flex shrink-0 flex-wrap items-center justify-end gap-1">
										{isRelevant && <Badge variant="default">関連TODO</Badge>}
										<Badge variant={todo.done ? "secondary" : "outline"}>
											{todo.done ? "完了" : "未完了"}
										</Badge>
									</div>
								</div>
								{todo.description && (
									<p className="text-xs text-muted-foreground whitespace-pre-wrap">
										{todo.description}
									</p>
								)}
							</div>
						);
					})}
				</CardContent>
			</Card>
		</div>
	);
}
