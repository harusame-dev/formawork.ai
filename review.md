# コードレビュー結果 - staff-edit ブランチ

## レビューサマリー

| 重要度 | 件数 | 主な指摘 |
|--------|------|----------|
| 🟥 高 | 2件 | トランザクションと Supabase Auth の整合性問題、スキーマ重複定義 |
| 🟨 中 | 3件 | コンポーネント複雑化、authUserId の null チェック不足、シード ID 変更影響 |
| 🟩 低 | 2件 | 不要なクエリ、スケルトンサイズ |

**最優先で対応すべき項目:**
1. **トランザクションと Auth 更新の整合性** - DB 更新成功後に Auth 更新が失敗するとロール情報が不整合になる
2. **スキーマ重複定義** - 既存の `staffEmailSchema` 等を再利用せず重複定義している

---

## 🟥 高：【トランザクションと Supabase Auth 更新の整合性問題】

### 🎯 対象箇所

#### apps/web/features/staff/edit/edit-staff.ts - L45-L81

```typescript
// DB更新をトランザクションで実行
await db.transaction(async (tx) => {
	await tx
		.update(staffsTable)
		.set({
			firstName,
			lastName,
		})
		.where(eq(staffsTable.staffId, staffId));

	await tx
		.update(authUsers)
		.set({ email })
		.where(eq(authUsers.id, authUserId));
});

// ロールが変更された場合のみ app_metadata を更新
if (originalRole !== role) {
	const supabase = createAdminClient();
	const { error: updateError } = await supabase.auth.admin.updateUserById(
		authUserId,
		{
			app_metadata: {
				role,
				staffId,
			},
		},
	);

	if (updateError) {
		logger.error("認証ユーザーの更新に失敗", {
			authUserId,
			error: updateError.message,
		});
		return fail(UPDATE_AUTH_ERROR_MESSAGE);
	}
}
```

### 💬 指摘内容

トランザクション内で DB 更新が成功した後、Supabase Auth API でのロール更新が失敗した場合、データベースの変更はコミット済みで Supabase Auth の `app_metadata` だけが古いままになる。これにより DB と Auth のロール情報が不整合になる可能性がある。

### 🧠 指摘の判断理由

- トランザクションは DB 更新の後にコミットされる
- Supabase Auth API の更新はトランザクション外で実行される
- `app_metadata` 更新失敗時に `fail()` を返しているが、DB 変更は既にコミット済み
- ロールはアクセス制御に使用されるため、不整合は重大なセキュリティリスクとなりうる

### 📝 修正案

#### A. Supabase Auth 更新を先に実行する

```typescript
// ロール変更がある場合、先に Supabase Auth を更新
if (originalRole !== role) {
	const supabase = createAdminClient();
	const { error: updateError } = await supabase.auth.admin.updateUserById(
		authUserId,
		{
			app_metadata: { role, staffId },
		},
	);

	if (updateError) {
		logger.error("認証ユーザーの更新に失敗", {
			authUserId,
			error: updateError.message,
		});
		return fail(UPDATE_AUTH_ERROR_MESSAGE);
	}
}

// DB更新をトランザクションで実行
await db.transaction(async (tx) => {
	await tx.update(staffsTable)...
	await tx.update(authUsers)...
});
```

##### ⤴️ メリット

- Auth 更新失敗時に DB は変更されないため、不整合が発生しない
- シンプルな実装で整合性を保証できる

##### ⤵️ デメリット

- Auth 更新成功後に DB 更新が失敗すると、Auth 側だけ更新される可能性がある（ただし、DB 更新失敗の確率は低い）

##### ⚖️ トレードオフ

- Auth 更新を先にすることで、より重要な DB 整合性を優先
- 完全な分散トランザクションが必要な場合は Saga パターンなどが必要だが、現状ではオーバーエンジニアリング

---

## 🟥 高：【edit-staff-action.ts でのスキーマ重複定義】

### 🎯 対象箇所

#### apps/web/features/staff/edit/edit-staff-action.ts - L19-L41

```typescript
schema: v.object({
	authUserId: v.string(),
	email: v.pipe(
		v.string("メールアドレスを入力してください"),
		v.minLength(1, "メールアドレスを入力してください"),
		v.email("正しいメールアドレス形式で入力してください"),
		v.maxLength(254, "メールアドレスは254文字以内で入力してください"),
	),
	firstName: v.pipe(
		v.string("名を入力してください"),
		v.minLength(1, "名を入力してください"),
		v.maxLength(24, "名は24文字以内で入力してください"),
	),
	lastName: v.pipe(
		v.string("姓を入力してください"),
		v.minLength(1, "姓を入力してください"),
		v.maxLength(24, "姓は24文字以内で入力してください"),
	),
	originalRole: v.string(),
	role: v.picklist(["admin", "user"], "ロールを選択してください"),
	staffId: v.string(),
}),
```

### 💬 指摘内容

`features/staff/schema.ts` に既に `staffEmailSchema`、`staffFirstNameSchema`、`staffLastNameSchema`、`staffRoleSchema` が定義されているにもかかわらず、同じバリデーションロジックを再定義している。さらに `registerStaffAction` は `registerStaffSchema` を使用しており、コードベースの一貫性が失われている。

### 🧠 指摘の判断理由

- DRY 原則違反：同じバリデーションロジックが2箇所に存在
- コーディングスタイルガイドライン: 「同じ概念には一貫した命名を使用すること」「同じ文字列リテラルを複数箇所で使用する場合は、定数として定義」
- `registerStaffAction` は `registerStaffSchema` を再利用しており、`editStaffAction` も同様のパターンを踏襲すべき

### 📝 修正案

#### A. 既存スキーマを再利用する

`features/staff/edit/schema.ts` にて既存スキーマを利用:

```typescript
import * as v from "valibot";
import {
	staffEmailSchema,
	staffFirstNameSchema,
	staffLastNameSchema,
	staffRoleSchema,
} from "../schema";

export const editStaffActionSchema = v.object({
	authUserId: v.string(),
	email: staffEmailSchema,
	firstName: staffFirstNameSchema,
	lastName: staffLastNameSchema,
	originalRole: v.string(),
	role: staffRoleSchema,
	staffId: v.string(),
});
```

`edit-staff-action.ts`:

```typescript
import { editStaffActionSchema } from "./schema";
// ...
export const editStaffAction = createServerAction(
	(params) => editStaff(params),
	{
		// ...
		schema: editStaffActionSchema,
	},
);
```

##### ⤴️ メリット

- DRY 原則に従い、バリデーションロジックの重複を排除
- 変更時に1箇所の修正で済む
- `registerStaffAction` とパターンが統一される

##### ⤵️ デメリット

- ファイル間の依存が増える

##### ⚖️ トレードオフ

- 依存は増えるが、コードベースの一貫性と保守性が向上する

---

## 🟨 中：【フォームコンポーネントの複雑化と単一責務原則違反】

### 🎯 対象箇所

#### apps/web/features/staff/register/edit-staff-form.tsx - L23-L65

```typescript
const registerSchema = v.object({
	email: staffEmailSchema,
	firstName: staffFirstNameSchema,
	lastName: staffLastNameSchema,
	password: staffPasswordSchema,
	role: staffRoleSchema,
});

const editSchema = v.object({
	email: staffEmailSchema,
	firstName: staffFirstNameSchema,
	lastName: staffLastNameSchema,
	role: staffRoleSchema,
});

type RegisterFormValues = v.InferOutput<typeof registerSchema>;
type EditFormValues = v.InferOutput<typeof editSchema>;
type FormValues = RegisterFormValues | EditFormValues;

type EditStaffFormProps =
	| {
			disabled?: boolean;
			staffId?: undefined;
			authUserId?: undefined;
			initialValues?: undefined;
			isSelf?: undefined;
	  }
	| {
			disabled?: boolean;
			staffId: string;
			authUserId: string;
			initialValues: {
				email: string;
				firstName: string;
				lastName: string;
				role: string;
			};
			isSelf: boolean;
	  };
```

### 💬 指摘内容

1つのコンポーネントが「登録モード」と「編集モード」の両方を担当しており、条件分岐が複雑になっている。また、ファイル名が `edit-staff-form.tsx` だが登録機能も含んでいるため、命名と実態が乖離している。

### 🧠 指摘の判断理由

- コーディングスタイル: Single Responsibility Principle (SRP)
- 命名規則: 「同じ概念やエンティティを指す場合は、ファイル名に関わらず常に同じ表現を使用すること」
- 条件分岐の増加により可読性・テスタビリティが低下

### 📝 修正案

#### A. 登録と編集を別コンポーネントに分離

```
features/staff/register/register-staff-form.tsx  # 登録専用
features/staff/edit/edit-staff-form.tsx          # 編集専用
features/staff/components/staff-form-fields.tsx  # 共通フィールド
```

##### ⤴️ メリット

- 各コンポーネントの責務が明確になる
- 条件分岐が減りテストが書きやすくなる
- 命名と実態が一致する

##### ⤵️ デメリット

- 一部コードの重複が発生する可能性
- コンポーネント数が増える

##### ⚖️ トレードオフ

- 現状のコードでも動作はするため、即時対応は必須ではない
- 今後の機能追加時にリファクタリングを検討

#### B. ファイル名を変更して実態に合わせる（最小対応）

`edit-staff-form.tsx` → `staff-form.tsx` に変更

##### ⤴️ メリット

- 実態に合った命名になる
- 変更が最小限

##### ⤵️ デメリット

- SRP違反は解消されない

##### ⚖️ トレードオフ

- 暫定対応としては許容可能

---

## 🟨 中：【StaffEditFormContainer での authUserId の null チェック不足】

### 🎯 対象箇所

#### apps/web/features/staff/edit/staff-edit-form-container.tsx - L24-L35

```typescript
return (
	<EditStaffForm
		authUserId={staff.authUserId || ""}
		disabled={false}
		initialValues={{
			email: staff.email,
			firstName: staff.firstName,
			lastName: staff.lastName,
			role: staff.role,
		}}
		isSelf={isSelf}
		staffId={staffId}
	/>
);
```

### 💬 指摘内容

`staff.authUserId` が `null` の場合、空文字列 `""` が渡される。この状態で編集を実行すると、`editStaff` 関数で `authUserId` が空文字列のまま Supabase Auth API が呼び出され、予期しないエラーが発生する可能性がある。

### 🧠 指摘の判断理由

- 堅牢性: `authUserId` がない場合は編集不可能とするべき
- データ整合性: スタッフには必ず `authUserId` が紐づいているはず
- `getStaffDetail` で `leftJoin` しているため `null` の可能性がある

### 📝 修正案

#### A. authUserId が null の場合は notFound を返す

```typescript
if (!staff || !staff.authUserId) {
	notFound();
}

return (
	<EditStaffForm
		authUserId={staff.authUserId}
		// ...
	/>
);
```

##### ⤴️ メリット

- 不正な状態でフォームが表示されない
- 型安全性が向上（`authUserId` が必ず `string` になる）

##### ⤵️ デメリット

- 稀なケースで 404 が表示される

##### ⚖️ トレードオフ

- `authUserId` がない状態は異常データであり、404 は適切な対応

---

## 🟨 中：【Supabase シードファイルの ID 値変更によるテスト影響】

### 🎯 対象箇所

#### packages/supabase/src/seed.ts - L26-L41

```typescript
{
	email: "test1@formawork.example.com",
	id: "a0000000-0000-0000-0000-000000000004",  // 変更前: 000000000001
	password: "Test@Pass123",
	role: "user",
	staffId: "00000000-0000-0000-0000-000000000001",
},
```

### 💬 指摘内容

シードデータの `id` 値が変更されている。E2E テストや他のシードデータでこれらの ID を参照している場合、テストが失敗する可能性がある。変更理由のコミットメッセージには「ID値を競合を避けるため変更」とあるが、何と競合していたのかが不明。

### 🧠 指摘の判断理由

- テストガイドライン: テストデータの変更は影響範囲を確認すべき
- シードデータは開発・テスト環境で参照されるため、変更時の影響を確認する必要がある

### 📝 修正案

#### A. 変更理由をドキュメント化し、影響範囲を確認

1. 変更が必要だった理由をコードコメントか CLAUDE.md に記載
2. E2E テストで使用している ID がないか確認

##### ⤴️ メリット

- 将来の開発者が変更理由を理解できる
- 潜在的なテスト失敗を事前に発見できる

##### ⤵️ デメリット

- 調査に時間がかかる

##### ⚖️ トレードオフ

- シードデータは開発者全員に影響するため、確認は必要

---

## 🟩 低：【edit-staff.ts の不要な編集可能性チェック】

### 🎯 対象箇所

#### apps/web/features/staff/edit/edit-staff.ts - L36-L44

```typescript
const staff = await db.query.staffsTable.findFirst({
	where: eq(staffsTable.staffId, staffId),
});

if (!staff) {
	logger.warn("スタッフが見つかりません", {
		staffId,
	});
	return fail(STAFF_NOT_FOUND_ERROR_MESSAGE);
}
```

### 💬 指摘内容

`staff` の存在確認後、実際には `staff` オブジェクトの値を使用していない。トランザクション内の `update` クエリで `staffId` を使って更新しているため、この存在確認クエリは冗長。

### 🧠 指摘の判断理由

- パフォーマンス: 不要なクエリを削減できる
- 更新クエリの結果（affected rows）で存在確認できる

### 📝 修正案

#### A. 更新結果で存在確認する

```typescript
const result = await db
	.update(staffsTable)
	.set({ firstName, lastName })
	.where(eq(staffsTable.staffId, staffId))
	.returning({ staffId: staffsTable.staffId });

if (result.length === 0) {
	return fail(STAFF_NOT_FOUND_ERROR_MESSAGE);
}
```

##### ⤴️ メリット

- クエリ数が1回減少
- パフォーマンス向上

##### ⤵️ デメリット

- トランザクション内でのエラーハンドリングが複雑になる

##### ⚖️ トレードオフ

- 現状のコードでも問題なく動作するため、優先度は低い

---

## 🟩 低：【スケルトンの固定幅ボタンサイズ】

### 🎯 対象箇所

#### apps/web/features/staff/edit/staff-edit-form-skeleton.tsx - L68-L71

```typescript
{/* ボタン */}
<div className="flex gap-2">
	<Skeleton aria-hidden className="h-9 w-[90px]" />
	<Skeleton aria-hidden className="h-9 w-[120px]" />
</div>
```

### 💬 指摘内容

ボタンのスケルトンサイズ（`w-[90px]`、`w-[120px]`）がハードコードされている。実際のボタンのサイズと異なる場合、CLS（Cumulative Layout Shift）が発生する可能性がある。

### 🧠 指摘の判断理由

- UXガイドライン: 「Skeleton を使用する際はロード後のデザインと一致させ CLS を防ぐこと」
- 実際のボタンテキスト（「キャンセル」「保存」）のサイズと一致しているか確認が必要

### 📝 修正案

#### A. 実際のボタンと同じサイズクラスを使用

```typescript
<div className="flex gap-2">
	<Skeleton aria-hidden className="h-9 w-20" /> {/* キャンセル相当 */}
	<Skeleton aria-hidden className="h-9 w-24" /> {/* 保存相当 */}
</div>
```

##### ⤴️ メリット

- CLSが発生しにくくなる

##### ⤵️ デメリット

- ボタンテキストが変わった場合に修正が必要

##### ⚖️ トレードオフ

- 正確なサイズは実際のレンダリング結果と比較して調整する必要がある
