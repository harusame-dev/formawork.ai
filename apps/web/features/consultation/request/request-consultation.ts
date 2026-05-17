import { fail, type Result, succeed } from "@harusame0616/result";
import { db } from "@workspace/db/client";
import { chatsTable } from "@workspace/db/schema/chat";
import { consultationsTable } from "@workspace/db/schema/consultation";
import { organizationsTable } from "@workspace/db/schema/organization";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { v7 as uuidv7 } from "uuid";
import { sendConsultationMail } from "../mail/send-consultation-mail";
import type { RequestConsultationParams } from "./schema";

const CHAT_NOT_FOUND = "チャットが見つかりません" as const;
const ORG_NOT_FOUND = "相談先の組織が見つかりません" as const;
const EMAIL_REQUIRED = "メールアドレスを入力してください" as const;
const MAIL_FAILED = "メール送信に失敗しました" as const;

type ErrorMessage =
	| typeof CHAT_NOT_FOUND
	| typeof ORG_NOT_FOUND
	| typeof EMAIL_REQUIRED
	| typeof MAIL_FAILED;

export async function requestConsultation(
	params: RequestConsultationParams,
): Promise<Result<{ consultationId: string }, ErrorMessage>> {
	const chat = await db
		.select({
			chatId: chatsTable.chatId,
			contactEmail: chatsTable.contactEmail,
		})
		.from(chatsTable)
		.where(eq(chatsTable.chatId, params.chatId))
		.limit(1);

	if (chat.length === 0) {
		return fail(CHAT_NOT_FOUND);
	}

	const existingEmail = chat[0]?.contactEmail ?? null;
	const email = existingEmail ?? params.contactEmail;
	if (!email) {
		return fail(EMAIL_REQUIRED);
	}

	const org = await db
		.select({
			email: organizationsTable.email,
			name: organizationsTable.name,
			organizationId: organizationsTable.organizationId,
		})
		.from(organizationsTable)
		.where(eq(organizationsTable.organizationId, params.targetOrgId))
		.limit(1);

	if (org.length === 0 || !org[0]) {
		return fail(ORG_NOT_FOUND);
	}
	const targetOrg = org[0];

	// 初回メアド入力なら chats.contact_email を更新
	if (!existingEmail) {
		await db
			.update(chatsTable)
			.set({ contactEmail: email })
			.where(eq(chatsTable.chatId, params.chatId));
	}

	const consultationId = uuidv7();
	await db.insert(consultationsTable).values({
		chatId: params.chatId,
		consultationId,
		contactEmail: email,
		targetOrgId: params.targetOrgId,
		todoId: params.todoId ?? null,
	});

	const headerList = await headers();
	const host = headerList.get("host") ?? "localhost:3000";
	const protocol = host.startsWith("localhost") ? "http" : "https";
	const chatUrl = `${protocol}://${host}/chats/${params.chatId}`;

	const mailResult = await sendConsultationMail({
		chatUrl,
		chatUuid: params.chatId,
		contactEmail: email,
		targetOrgEmail: targetOrg.email,
		targetOrgName: targetOrg.name,
	});

	if (!mailResult.success) {
		return fail(MAIL_FAILED);
	}

	return succeed({ consultationId });
}
