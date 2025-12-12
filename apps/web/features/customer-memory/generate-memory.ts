import { valibotSchema } from "@ai-sdk/valibot";
import { getLogger } from "@repo/logger/nextjs/server";
import {
	MEMORY_CATEGORY,
	MEMORY_CATEGORY_LABELS,
	type MemoryCategory,
} from "@workspace/db/schema/customer-memory";
import { generateObject } from "ai";
import * as v from "valibot";
import { GENDER_LABELS, type Gender } from "@/features/customer/schema";

type CustomerInfo = {
	birthDate: string | null;
	firstName: string;
	gender: Gender;
	lastName: string;
	remarks: string;
};

type NoteInfo = {
	id: string;
	content: string;
	serviceDate: string;
};

type ContextNote = {
	content: string;
	createdAt: Date;
};

type ExistingMemory = {
	id: string;
	category: MemoryCategory;
	content: string;
	importance: number;
};

export type GenerateMemoryOperationsParams = {
	contextNotes: ContextNote[];
	customer: CustomerInfo;
	existingMemories: ExistingMemory[];
	targetNotes: NoteInfo[];
};

const createOperationSchema = v.object({
	category: v.pipe(
		v.number(),
		v.minValue(1),
		v.maxValue(6),
		v.description("カテゴリ番号（1-6）"),
	),
	content: v.pipe(
		v.string(),
		v.minLength(1),
		v.maxLength(500),
		v.description("メモリー内容"),
	),
	importance: v.pipe(
		v.number(),
		v.minValue(1),
		v.maxValue(10),
		v.description("重要度（1-10）"),
	),
	operation: v.literal("create"),
	reason: v.pipe(v.string(), v.description("この操作を行う理由")),
});

const updateOperationSchema = v.object({
	memoryId: v.pipe(v.string(), v.uuid(), v.description("更新対象のメモリーID")),
	newContent: v.optional(
		v.pipe(
			v.string(),
			v.minLength(1),
			v.maxLength(500),
			v.description("新しいメモリー内容"),
		),
	),
	newImportance: v.optional(
		v.pipe(
			v.number(),
			v.minValue(1),
			v.maxValue(10),
			v.description("新しい重要度"),
		),
	),
	operation: v.literal("update"),
	reason: v.pipe(v.string(), v.description("更新理由")),
});

const deleteOperationSchema = v.object({
	memoryId: v.pipe(v.string(), v.uuid(), v.description("削除対象のメモリーID")),
	operation: v.literal("delete"),
	reason: v.pipe(v.string(), v.description("削除理由")),
});

const memoryOperationSchema = v.union([
	createOperationSchema,
	updateOperationSchema,
	deleteOperationSchema,
]);

const memoryResultSchema = v.object({
	operations: v.array(memoryOperationSchema),
});

export type MemoryOperation = v.InferOutput<typeof memoryOperationSchema>;
type MemoryResult = v.InferOutput<typeof memoryResultSchema>;

function generatePrompt({
	contextNotes,
	customer,
	existingMemories,
	targetNotes,
}: GenerateMemoryOperationsParams): string {
	const targetNotesSection = targetNotes
		.map(
			(note, index) =>
				`--- ${index + 1}件目 (${note.serviceDate}) ---
${note.content}`,
		)
		.join("\n\n");

	const contextNotesSection =
		contextNotes.length > 0
			? contextNotes
					.map(
						(note, index) =>
							`--- ${index + 1}件目 (${note.createdAt.toLocaleDateString("ja-JP")}) ---
${note.content}`,
					)
					.join("\n\n")
			: "なし";

	const categoryDescriptions = Object.entries(MEMORY_CATEGORY)
		.map(([_key, value]) => `${value}: ${MEMORY_CATEGORY_LABELS[value]}`)
		.join("\n");

	const existingMemoriesSection =
		existingMemories.length > 0
			? existingMemories
					.map(
						(memory) =>
							`- [ID: ${memory.id}] [カテゴリ: ${MEMORY_CATEGORY_LABELS[memory.category]}] [重要度: ${memory.importance}] ${memory.content}`,
					)
					.join("\n")
			: "なし";

	return `あなたは顧客情報管理AIです。
接客ノートから顧客の重要な情報を抽出し、メモリーとして管理してください。

---

## 顧客情報
- 名前: ${customer.lastName} ${customer.firstName} 様
- 生年月日: ${customer.birthDate || "未登録"}
- 性別: ${GENDER_LABELS[customer.gender]}
- 備考: ${customer.remarks || "なし"}

## 今回処理する接客ノート
${targetNotesSection}

## その他の接客メモ（参考情報、最大10件、新しい順）
${contextNotesSection}

## 既存メモリー（現在 ${existingMemories.length}件 / 最大100件）
${existingMemoriesSection}

---

## カテゴリ定義
${categoryDescriptions}

### カテゴリの使い分け

**1: パーソナル情報**
家族構成、職業、居住地、ライフステージなど基本的な属性情報
例：「子供が2人いる」「会社員」「来月引っ越し予定」

**2: 趣味趣向**
好き嫌い、興味関心、こだわりなど
例：「自然派化粧品を好む」「短時間の施術を希望」「流行に敏感」

**3: コンバージョン傾向**
購買パターン、成約しやすい提案方法など
例：「限定商品に弱い」「比較説明すると購入しやすい」「口コミを重視」

**4: コミュニケーション特性**
接客時の好み、NGトピック、話し方の特徴など
例：「静かに過ごしたい」「仕事の話はNG」「世間話が好き」

**5: 重要イベント**
記念日、予定、ライフイベントなど
例：「来月結婚式」「毎年3月に旅行」「12/25が誕生日」

**6: 健康・身体的配慮**
アレルギー、体質、施術上の注意点など
例：「金属アレルギーあり」「頭皮が敏感」「肩こりがひどい」

---

## 重要度ガイドライン（1-10）

- **10**: 接客に直結する最重要情報（アレルギー、強いNG項目、クレーム履歴）
- **8-9**: 毎回確認すべき重要情報（施術の好み、コミュニケーション上の注意）
- **6-7**: 提案や会話に活用できる情報（趣味、家族の状況）
- **4-5**: 知っていると良い一般情報（職業、住んでいるエリア）
- **1-3**: 補助的な情報（一度だけ言及された話題など）

---

## タスク

1. **新規作成（create）**: 接客ノートから新たに発見した重要情報をメモリーに追加
2. **更新（update）**: 既存メモリーの内容が古い/不正確な場合に更新
3. **削除（delete）**: 明らかに誤りまたは無効になった情報を削除

### 重要なルール

- **重複禁止**: 既存メモリーと実質的に同じ内容は登録しない
- **事実ベース**: 接客ノートから確実に読み取れる情報のみ登録
- **推測禁止**: 曖昧な情報や推測は登録しない
- **簡潔に**: 1件あたり100文字以内で要点を記録
- **100件制限**: 既存が90件以上の場合、重要度の低いものの削除も検討
- **更新は慎重に**: 古い情報でも履歴として価値がある場合は残す
- **操作不要の場合**: 空の operations 配列を返す

---

## 出力フォーマット（JSON）

{
  "operations": [
    {
      "operation": "create",
      "category": 1,
      "content": "メモリー内容",
      "importance": 7,
      "reason": "登録理由"
    },
    {
      "operation": "update",
      "memoryId": "uuid",
      "newContent": "新しい内容",
      "newImportance": 8,
      "reason": "更新理由"
    },
    {
      "operation": "delete",
      "memoryId": "uuid",
      "reason": "削除理由"
    }
  ]
}

---

## 注意事項

- 1回の接客で抽出するメモリーは通常0〜3件程度
- 日常的な会話や一般的な感想はメモリーにしない
- 将来の接客で活用できる情報のみ登録
- 既存メモリーと矛盾する情報は、どちらが正しいか判断してから操作
- カテゴリは最も適切なものを1つ選択`;
}

export async function generateMemoryOperations(
	params: GenerateMemoryOperationsParams,
): Promise<MemoryResult> {
	const logger = await getLogger("generateMemoryOperations");

	const options = {
		experimental_telemetry: { isEnabled: true },
		maxOutputTokens: 2048,
		model: "google/gemini-2.5-flash",
		prompt: generatePrompt(params),
		schema: valibotSchema(memoryResultSchema),
		temperature: 0.3,
		topP: 0.9,
	} as const satisfies Parameters<typeof generateObject>[0];

	logger.info("メモリー生成パラメーター：", { options });

	const { object } = await generateObject(options);

	return object;
}
