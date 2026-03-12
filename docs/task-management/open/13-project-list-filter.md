# チケット 13: プロジェクト一覧フィルタリング機能強化

## 概要

プロジェクト一覧画面（`/projects`）のフィルタリング機能を強化する。
ステータス（チェックボックスによる複数選択）・担当者・期限範囲・案件名フリー入力でのフィルタリングを実装する。

## 背景

チケット 06 で実装した検索・絞り込み機能は、ステータスが単一選択（ドロップダウン）のみだった。
案件数の増加に伴い、複数ステータスの同時絞り込みや期限による絞り込みが現場で必要とされている。

## 前提チケット

- チケット 06（検索・絞り込み機能）完了済み

## 実装内容

### 検索・絞り込みパラメータ

| パラメータ名 | 型 | 概要 |
|---|---|---|
| `q` | string | 案件名の部分一致検索（フリー入力） |
| `status` | `todo` \| `in_progress` \| `done`（複数可） | ステータス絞り込み（チェックボックス） |
| `assigneeId` | UUID（複数可） | 担当者絞り込み |
| `dueDateFrom` | `YYYY-MM-DD` | 期限の開始日（以降） |
| `dueDateTo` | `YYYY-MM-DD` | 期限の終了日（以前） |
| `page` | number | ページ番号 |

### UI 構成

```
[案件名 フリー入力]

[ステータス]
  ☐ 未着手  ☐ 進行中  ☐ 完了

[担当者 マルチ選択ドロップダウン]

[期限]
  [開始日 DatePicker] 〜 [終了日 DatePicker]

[絞り込みボタン]  [リセットボタン]
```

- 案件名はデバウンス（300ms）または Enter キー / ボタン押下で検索
- ステータスはチェックボックス（複数選択可）。未選択の場合は全ステータスを対象とする
- 担当者はマルチ選択可能なドロップダウン。`staffs` テーブルから取得。未選択の場合は全担当者を対象とする
- 期限は DatePicker を使用。開始日のみ・終了日のみの指定も可
- 絞り込み条件のリセットボタンで全件表示に戻る
- 絞り込み中は「XX件中 XX件」などの件数表示を行う

### URL クエリパラメータ

- 検索条件は URL クエリパラメータに反映し、ページ共有・ブラウザ履歴が機能するようにする
- ステータス・担当者は複数値を持てるよう `?status=todo&status=in_progress&assigneeId=xxx&assigneeId=yyy` 形式とする
- Next.js の `useSearchParams` / `useRouter` を使用（Client Component）
- 絞り込み変更時は `page=1` にリセット

### Server 側のクエリ実装

Drizzle ORM で以下の条件を組み合わせた SELECT を実装する：

```typescript
const where = and(
  q ? ilike(projects.name, `%${q}%`) : undefined,
  statuses?.length ? inArray(projects.status, statuses) : undefined,
  assigneeIds?.length ? inArray(projects.assigneeId, assigneeIds) : undefined,
  dueDateFrom ? gte(projects.dueDate, dueDateFrom) : undefined,
  dueDateTo ? lte(projects.dueDate, dueDateTo) : undefined,
);
```

## features 構成

既存の `features/project/list/` を拡張する。

```
features/project/
  list/
    project-list-filter.client.tsx   ← フィルタリング UI（Client Component）※既存の検索UIを置き換え
    project-list-page.tsx            ← 検索パラメータを受け取り DB クエリに渡す（Server Component）
```

## 完了条件

- [ ] 案件名でフリー入力検索できる（既存機能の踏襲）
- [ ] ステータスをチェックボックスで複数選択して絞り込める
- [ ] 担当者をマルチ選択ドロップダウンで複数選択して絞り込める
- [ ] 期限の開始日・終了日で範囲絞り込みできる（片方のみの指定も可）
- [ ] 複数条件の組み合わせが正しく機能する
- [ ] 検索条件が URL クエリパラメータに反映される
- [ ] リセットで全件表示に戻る
- [ ] ページネーションと組み合わせて正しく動作する
- [ ] `pnpm -w validate:check` と `pnpm -w build` が通る
