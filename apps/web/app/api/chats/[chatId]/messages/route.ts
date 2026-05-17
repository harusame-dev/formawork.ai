import { valibotSchema } from "@ai-sdk/valibot";
import { db } from "@workspace/db/client";
import { organizationsTable } from "@workspace/db/schema/organization";
import { organizationCategoriesTable } from "@workspace/db/schema/organization-category";
import { generateObject, stepCountIs, streamText, tool } from "ai";
import { eq } from "drizzle-orm";
import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import * as v from "valibot";
import { getChat, touchChatLastAccessedAt } from "@/features/chat/get-chat";
import { getChatModel } from "@/features/chat/llm/chat-model";
import {
	appendChatMessage,
	getChatMessages,
} from "@/features/chat/messages/get-messages";
import {
	buildChatSystemPrompt,
	buildTodoExtractionSystemPrompt,
} from "@/features/chat/system-prompt";
import { ChatTag } from "@/features/chat/tag";
import { getChatTodos } from "@/features/chat/todos/get-todos";
import { setTodosDoneByIds } from "@/features/chat/todos/update-todo-done";
import { upsertTodos } from "@/features/chat/todos/upsert-todos";
import { getOrganizationCategories } from "@/features/organization-category/get-organization-categories";

const requestSchema = v.object({
	message: v.pipe(v.string(), v.minLength(1), v.maxLength(2000)),
});

const todoExtractionSchema = v.object({
	todos: v.array(
		v.object({
			description: v.string(),
			priority: v.pipe(v.number(), v.minValue(0), v.maxValue(6)),
			suggestedCategoryId: v.union([v.string(), v.null_()]),
			title: v.string(),
		}),
	),
});

const markTodosInputSchema = v.object({
	todoIds: v.pipe(
		v.array(v.pipe(v.string(), v.uuid())),
		v.minLength(1, "todoIds を 1 つ以上指定してください"),
	),
});

export async function POST(
	request: Request,
	context: { params: Promise<{ chatId: string }> },
) {
	const { chatId } = await context.params;

	const chat = await getChat(chatId);
	if (!chat) {
		return NextResponse.json({ error: "not_found" }, { status: 404 });
	}

	const body = await request.json().catch(() => null);
	const parseResult = v.safeParse(requestSchema, body);
	if (!parseResult.success) {
		return NextResponse.json({ error: "invalid_input" }, { status: 400 });
	}

	const userMessage = parseResult.output.message;

	// 紹介元組織のカテゴリーを取得（組織が削除済みなら null）
	const orgInfo = chat.referrerOrgId
		? await db
				.select({ categoryName: organizationCategoriesTable.name })
				.from(organizationsTable)
				.innerJoin(
					organizationCategoriesTable,
					eq(
						organizationsTable.categoryId,
						organizationCategoriesTable.categoryId,
					),
				)
				.where(eq(organizationsTable.organizationId, chat.referrerOrgId))
				.limit(1)
		: [];

	const referrerCategory = orgInfo[0]?.categoryName ?? null;
	const categories = await getOrganizationCategories();
	const currentTodos = await getChatTodos(chatId);
	const systemPrompt = buildChatSystemPrompt({
		categories,
		referrerCategory,
		todos: currentTodos,
	});

	// ユーザーメッセージを保存
	await appendChatMessage({
		chatId,
		content: userMessage,
		role: "user",
	});

	const history = await getChatMessages(chatId);
	const messages = history
		.filter((m) => m.role === "user" || m.role === "assistant")
		.map((m) => ({
			content: m.content,
			role: m.role as "user" | "assistant",
		}));

	await touchChatLastAccessedAt(chatId);
	revalidateTag(ChatTag.Detail(chatId), "permanent");

	const result = streamText({
		messages,
		model: getChatModel(),
		onFinish: async ({ text }) => {
			await appendChatMessage({
				chatId,
				content: text,
				role: "assistant",
			});

			// TODO 構造化抽出（done 状態はここでは更新しない）
			try {
				const latestTodos = await getChatTodos(chatId);
				const todosResult = await generateObject({
					messages: [
						...messages,
						{ content: text, role: "assistant" as const },
					],
					model: getChatModel(),
					schema: valibotSchema(todoExtractionSchema),
					system: `${buildTodoExtractionSystemPrompt({
						todos: latestTodos,
					})}\n\n利用可能なカテゴリー:\n${categories
						.map((c) => `- ${c.categoryId}: ${c.name}`)
						.join("\n")}`,
				});

				const validCategoryIds = new Set(categories.map((c) => c.categoryId));
				const todos = todosResult.object.todos.map((t) => ({
					description: t.description,
					priority: t.priority,
					suggestedCategoryId:
						t.suggestedCategoryId && validCategoryIds.has(t.suggestedCategoryId)
							? t.suggestedCategoryId
							: null,
					title: t.title,
				}));

				await upsertTodos({ chatId, todos });
				revalidateTag(ChatTag.Todos(chatId), "permanent");
				revalidateTag(ChatTag.Messages(chatId), "permanent");
			} catch {
				// TODO 抽出失敗してもチャット自体は成立させる
			}
		},
		stopWhen: stepCountIs(4),
		system: systemPrompt,
		tools: {
			markTodosDone: tool({
				description:
					"相談者が完了報告したタスクを完了済みにマークします。完了報告が明示された場合のみ呼び出してください。",
				execute: async ({ todoIds }) => {
					const { updatedTodoIds } = await setTodosDoneByIds({
						chatId,
						done: true,
						todoIds,
					});
					return { updatedTodoIds };
				},
				inputSchema: valibotSchema(markTodosInputSchema),
			}),
			markTodosUndone: tool({
				description:
					"完了済みにしたタスクを未完了に戻します。相談者からの取り消し希望が明示された場合のみ呼び出してください。",
				execute: async ({ todoIds }) => {
					const { updatedTodoIds } = await setTodosDoneByIds({
						chatId,
						done: false,
						todoIds,
					});
					return { updatedTodoIds };
				},
				inputSchema: valibotSchema(markTodosInputSchema),
			}),
		},
	});

	return result.toTextStreamResponse();
}
