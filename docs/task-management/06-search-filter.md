# チケット 06: 検索・絞り込み機能

## 概要

案件一覧画面に、キーワード検索・ステータス絞り込み・担当者絞り込みを実装する。

## 背景

案件・タスクの増加に伴い、目的のデータへ素早くアクセスできる手段が必要。
検索条件は URL クエリパラメータとして管理し、ブラウザの戻る/進む・ページ共有が可能な設計とする。

## 前提チケット

- チケット 04（案件管理）完了済み

## 現状の参考実装

既存の顧客管理にも絞り込み機能が実装されている可能性があるため、
`features/customer/list/` の実装を確認して参考にする。

## 実装内容

### 対象画面

案件一覧画面（`/projects`）に検索・絞り込み UI を追加する。
タスク単独の検索は本フェーズでは対象外とする（案件詳細画面内で目視できる範囲のため）。

### 検索・絞り込みパラメータ

| パラメータ名 | 型 | 概要 |
|---|---|---|
| `q` | string | キーワード検索（案件名の部分一致） |
| `status` | `todo` \| `in_progress` \| `done` \| なし | ステータス絞り込み |
| `assigneeId` | UUID \| なし | 担当者絞り込み |
| `page` | number | ページ番号 |

### UI 構成

```
[キーワード検索入力欄]  [ステータス選択]  [担当者選択]  [絞り込みボタン]
```

- キーワード入力はデバウンス（300ms）または Enter キー / ボタン押下でのみ検索する
- ステータス・担当者はドロップダウン Select（`packages/ui/src/components/select.tsx`）
- 担当者一覧は `staffs` テーブルから取得
- 絞り込み条件のリセットボタンを設ける
- 絞り込み中は「XX件中 XX件」などの件数表示を行う

### URL クエリパラメータ

- 検索条件は URL クエリパラメータに反映し、ページ共有・ブラウザ履歴が機能するようにする
- Next.js の `useSearchParams` / `useRouter` を使用する（Client Component）
- ページネーションとの組み合わせ：絞り込み変更時は page=1 にリセット

### Server 側のクエリ実装

Drizzle ORM で以下の条件を組み合わせた SELECT を実装する：

```typescript
// 概要（実装例）
const where = and(
  q ? ilike(projects.name, `%${q}%`) : undefined,
  status ? eq(projects.status, status) : undefined,
  assigneeId ? eq(projects.assigneeId, assigneeId) : undefined,
);
```

### 担当者別一覧

「自分の担当案件のみ表示」は担当者絞り込みの一種として実装する。
ダッシュボード（チケット 07）の「自分の担当一覧」と共通のロジックを使用する。

## features 構成

```
features/project/
  list/
    project-list-search.client.tsx   ← 検索・絞り込み UI（Client Component）
    project-list-page.tsx            ← 検索パラメータを受け取り DB クエリに渡す（Server Component）
```

## 完了条件

- [ ] キーワード検索で案件名を部分一致検索できる
- [ ] ステータスで絞り込める（単一選択）
- [ ] 担当者で絞り込める
- [ ] 複数条件の組み合わせが機能する
- [ ] 検索条件が URL クエリパラメータに反映される
- [ ] リセットで全件表示に戻る
- [ ] ページネーションと組み合わせて正しく動作する
- [ ] `pnpm -w validate:check` と `pnpm -w build` が通る
