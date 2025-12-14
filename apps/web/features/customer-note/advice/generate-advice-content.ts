import { valibotSchema } from "@ai-sdk/valibot";
import { getLogger } from "@repo/logger/nextjs/server";
import type { AdviceContent } from "@workspace/db/schema/customer-note-advice";
import { generateObject } from "ai";
import * as v from "valibot";
import { GENDER_LABELS, type Gender } from "@/features/customer/schema";

type CustomerInfo = {
	birthDate: string | null;
	firstName: string;
	gender: Gender;
	lastName: string;
	remarks: string | null;
};

type RecentNote = {
	content: string;
	createdAt: Date;
};

type GenerateAdviceParams = {
	customer: CustomerInfo;
	noteContent: string;
	recentNotes: RecentNote[];
	serviceDate: string;
};

/**
 * AI 生成結果のバリデーション用スキーマ
 *
 * satisfies で AdviceContent 型との整合性をコンパイル時にチェック。
 * 型定義は packages/db/src/schema/customer-note-advice.ts を参照。
 */
const adviceSchema = v.object({
	currentEvaluation: v.object({
		good: v.pipe(
			v.string(),
			v.description("今回の接客で良かった点。具体的な行動と顧客への影響"),
		),
		improvement: v.pipe(
			v.string(),
			v.description("今回の接客の改善ポイント。課題と代替案"),
		),
	}),
	nextAdvice: v.object({
		caution: v.pipe(
			v.string(),
			v.description(
				"注意点・避けるべきこと。過去の反応から避けた方がよいアプローチ",
			),
		),
		followUpItems: v.pipe(
			v.string(),
			v.description(
				"確認・フォローすべきこと。未解決の要望、クレーム、宿題など",
			),
		),
		nextActions: v.pipe(
			v.string(),
			v.description(
				"次回に向けて確認しておくこと。接客の最後に確認・約束すべきこと",
			),
		),
		openingTopics: v.pipe(
			v.string(),
			v.description("冒頭で触れるべきこと。前回からの繋がりを感じさせる話題"),
		),
		salesOpportunities: v.pipe(
			v.string(),
			v.description("提案の機会。顧客に提案できる商品・サービス・情報と理由"),
		),
	}),
}) satisfies v.GenericSchema<AdviceContent>;

function generatePrompt({
	customer,
	noteContent,
	recentNotes,
	serviceDate,
}: GenerateAdviceParams): string {
	const recentNotesSection =
		recentNotes.length > 0
			? recentNotes
					.map(
						(note, index) =>
							`--- ${index + 1}件目 (${note.createdAt.toLocaleDateString("ja-JP")}) ---
${note.content}`,
					)
					.join("\n\n")
			: "なし";

	return `あなたは接客コーチです。
以下の情報をもとに、今回の接客の評価と、次回接客時のアドバイスを生成してください。

---

## 接客日
${serviceDate}

## 顧客情報
- 名前: ${customer.lastName} ${customer.firstName} 様
- 生年月日: ${customer.birthDate || "未登録"}
- 性別: ${GENDER_LABELS[customer.gender]}
- 備考: ${customer.remarks || "なし"}

## 今回の接客メモ
${noteContent}

## 直近10回の接客メモ（新しい順）
${recentNotesSection}

---

## 出力要件

### 今回の接客評価 (currentEvaluation)

**良かった点 (good)**
今回の接客で効果的だったと思われる行動・対応を挙げてください。
- 具体的に何をしたか
- なぜそれが良かったか（顧客への影響）

**改善ポイント (improvement)**
今回の接客で改善の余地があると思われる点を挙げてください。
- 具体的に何が課題か
- どうすればより良かったか（代替案）

※接客メモは本人記録のため、記録されていない問題がある可能性があります。
※断定ではなく「〜の可能性がある」「〜だったかもしれない」の表現を使ってください。

---

### 次回の接客アドバイス (nextAdvice)

**冒頭で触れるべきこと (openingTopics)**
前回からの繋がりを感じさせる話題や確認事項。
「〇〇について、その後いかがですか？」のように具体的に。

**確認・フォローすべきこと (followUpItems)**
未解決の要望、過去のクレーム、前回の宿題など。
放置すると不満に繋がるものを優先。

**提案の機会 (salesOpportunities)**
顧客の状況・嗜好から、提案できそうな商品・サービス・情報。
なぜその顧客に合うかの理由も添える。

**注意点・避けるべきこと (caution)**
過去の反応から、この顧客に対して避けた方がよいアプローチ。

**次回に向けて確認しておくこと (nextActions)**
今回の接客の最後に確認・約束しておくと良いこと。

---

## 出力フォーマット（JSON）

以下の形式で出力してください。すべてのフィールドは必須です。

{
  "currentEvaluation": {
    "good": "今回の接客で良かった点。具体的な行動と顧客への影響を記述",
    "improvement": "今回の接客の改善ポイント。課題と代替案を記述"
  },
  "nextAdvice": {
    "openingTopics": "冒頭で触れるべきこと。前回からの繋がりを感じさせる話題",
    "followUpItems": "確認・フォローすべきこと。未解決の要望、クレーム、宿題など",
    "salesOpportunities": "提案の機会。顧客に提案できる商品・サービス・情報と理由",
    "caution": "注意点・避けるべきこと。過去の反応から避けた方がよいアプローチ",
    "nextActions": "次回に向けて確認しておくこと。接客の最後に確認・約束すべきこと"
  }
}

---

## 注意事項
- 情報が不足している項目は「情報不足のため判断不可」と明記
- 推測で補う場合は「〜と推測されるため」と理由を明示
- 売上への貢献と顧客満足の両立を意識する
- 評価は批判ではなく、改善のためのフィードバックとして記述する
- 抽象的な表現（「信頼関係を築けた」「丁寧に対応できた」など）は禁止
- 必ず具体的な行動・発言レベルで記述
- 各項目は簡潔に。1項目あたり1〜3文程度
- 必ず上記のJSON形式で出力すること`;
}

export async function generateAdviceContent(
	params: GenerateAdviceParams,
): Promise<AdviceContent> {
	const logger = await getLogger("generateAdviceContent");

	const options = {
		experimental_telemetry: { isEnabled: true },
		maxOutputTokens: 2048,
		model: "google/gemini-2.5-flash",
		prompt: generatePrompt(params),
		schema: valibotSchema(adviceSchema),
		temperature: 0.3,
		topP: 0.9,
	} as const satisfies Parameters<typeof generateObject>[0];

	logger.info("生成パラメーター：", { options });

	const { object } = await generateObject(options);

	return object;
}
