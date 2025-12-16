import { index, jsonb, pgSchema, timestamp, uuid } from "drizzle-orm/pg-core";
import { schemaName } from "../pgschema";
import { customerNotesTable } from "./customer-note";

/**
 * 接客アドバイスの型定義
 *
 * TODO: 型安全性の改善
 *
 * 【現状の課題】
 * - AdviceContent 型（ここ）と Valibot スキーマ（generate-advice.ts）が分離している
 * - 変更時に手動で同期が必要（satisfies で整合性チェックはしている）
 *
 * 【なぜこの設計か】
 * - Valibot スキーマは AI 生成結果のバリデーション用（アプリケーションロジック）
 * - DB パッケージにアプリケーションロジックを置くのは責務違反
 * - 型は jsonb カラムの型定義として DB パッケージに置くのが自然
 *
 * 【トレードオフ】
 * - 現状: 型とスキーマの二重管理が必要だが、責務は明確
 * - 理想: 共有パッケージ（packages/schemas）を新設し一元管理
 *   → パッケージ増加のコストと天秤にかけ、現状は見送り
 *
 * 【関連ファイル】
 * - apps/web/features/customer-note/advice/generate-advice.ts（adviceSchema）
 */

/**
 * 今回の接客評価
 */
export type CurrentEvaluation = {
	/** 良かった点 */
	good: string;
	/** 改善ポイント */
	improvement: string;
};

/**
 * 次回の接客アドバイス
 */
export type NextAdvice = {
	/** 注意点・避けるべきこと */
	caution: string;
	/** 確認・フォローすべきこと */
	followUpItems: string;
	/** 次回に向けて確認しておくこと */
	nextActions: string;
	/** 冒頭で触れるべきこと */
	openingTopics: string;
	/** 提案の機会 */
	salesOpportunities: string;
};

/**
 * 接客アドバイスJSON構造
 */
export type AdviceContent = {
	currentEvaluation: CurrentEvaluation;
	nextAdvice: NextAdvice;
};

export const customerNoteAdviceTable = pgSchema(schemaName).table(
	"customer_note_advice",
	{
		advice: jsonb("advice").$type<AdviceContent>().notNull(),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		customerNoteId: uuid("customer_note_id")
			.notNull()
			.references(() => customerNotesTable.customerNoteId, {
				onDelete: "cascade",
			}),
		id: uuid("id").primaryKey().defaultRandom(),
	},
	(table) => [
		// customerNoteId + createdAt DESC の複合インデックス
		// customerNoteId だけの検索もこのインデックスでカバーされる
		index("idx_customer_note_advice_created").on(
			table.customerNoteId,
			table.createdAt.desc(),
		),
	],
);

export type SelectCustomerNoteAdvice =
	typeof customerNoteAdviceTable.$inferSelect;
export type InsertCustomerNoteAdvice =
	typeof customerNoteAdviceTable.$inferInsert;
