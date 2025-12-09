import { generateText } from "ai";

const MAX_OUTPUT_TOKENS = 512;

type CustomerInfo = {
	firstName: string;
	lastName: string;
};

type RecentNote = {
	content: string;
	createdAt: Date;
};

type GenerateAdviceParams = {
	customer: CustomerInfo;
	noteContent: string;
	recentNotes: RecentNote[];
};

export async function generateAdvice({
	customer,
	noteContent,
	recentNotes,
}: GenerateAdviceParams): Promise<string> {
	const recentNotesSection =
		recentNotes.length > 0
			? `
過去の接客履歴（直近${recentNotes.length}件）:
${recentNotes
	.map(
		(note, index) =>
			`--- ${index + 1}件目 (${note.createdAt.toLocaleDateString("ja-JP")}) ---
${note.content}`,
	)
	.join("\n\n")}`
			: "";

	const { text } = await generateText({
		maxOutputTokens: MAX_OUTPUT_TOKENS,
		model: "google/gemini-2.0-flash",
		prompt: `以下のお客様情報と接客ノートを読んで、次回の接客に役立つ具体的なアドバイスを日本語で生成してください。
アドバイスは簡潔で実践的なものにしてください（200文字程度）。
過去の接客履歴がある場合は、その傾向も踏まえてアドバイスしてください。

お客様情報:
- お名前: ${customer.lastName} ${customer.firstName} 様
${recentNotesSection}

今回の接客ノート:
${noteContent}

アドバイス:`,
	});

	return text;
}
