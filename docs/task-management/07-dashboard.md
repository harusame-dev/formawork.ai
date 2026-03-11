# チケット 07: ダッシュボード（簡易）

## 概要

ログイン後の初期画面（`/`）を、案件数サマリー・進行状況・自分の担当一覧を表示する
ダッシュボードに作り替える。

## 背景

現在のダッシュボードは CRM 向けのコンテンツ（AI アドバイス等）で構成されている。
チケット 00 の AI 機能削除後、このページは空になるため、新しいダッシュボードに置き換える。

## 前提チケット

- チケット 00（不要機能削除）完了済み
- チケット 04（案件管理）完了済み
- チケット 05（タスク管理）完了済み

## 実装内容

### ルート

`app/(private)/page.tsx`（既存ファイル）を修正する。

### 表示セクション

#### 1. 案件数サマリーカード

4 つのカードを横並びで表示：

| カード | 内容 |
|---|---|
| 総案件数 | 全ステータスの合計件数 |
| 未着手 | status = `todo` の件数 |
| 進行中 | status = `in_progress` の件数 |
| 完了 | status = `done` の件数 |

カードクリックで該当ステータスの案件一覧（`/projects?status=xxx`）に遷移する。

#### 2. 進行状況の可視化

ステータス別件数を棒グラフまたは円グラフで表示。
複雑なグラフライブラリは使用せず、**Tailwind CSS の幅・色クラスで表現するバーグラフ**を実装する。
（サードパーティのグラフライブラリ導入は本フェーズでは不要）

例：
```
未着手 ████████░░░░░░ 5件
進行中 ██████████░░░░ 7件
完了   ████░░░░░░░░░░ 3件
```

#### 3. 自分の担当案件・タスク一覧

ログインユーザーの `staffId`（`getUserStaffId()` で取得）を使い、
`assigneeId = staffId` の案件・タスクを表示する。

- 担当案件：直近 5 件（期限昇順 or 更新日時降順）
- 担当タスク：直近 5 件（期限昇順 or 更新日時降順）
- 「すべて見る」リンクで `/projects?assigneeId=xxx` に遷移

## features 構成

```
features/dashboard/
  dashboard-page.tsx                      ← ダッシュボードページ（Server Component）
  project-summary-cards.tsx               ← 案件数サマリーカード
  project-status-bar.tsx                  ← 進行状況バーグラフ
  my-projects-list.tsx                    ← 自分の担当案件一覧
  my-tasks-list.tsx                       ← 自分の担当タスク一覧
```

## データ取得

すべて Server Component でのデータフェッチとする。

```typescript
// 案件数サマリー
const summary = await db
  .select({
    status: projects.status,
    count: count(),
  })
  .from(projects)
  .groupBy(projects.status);

// 自分の担当案件
const myProjects = await db
  .select()
  .from(projects)
  .where(eq(projects.assigneeId, staffId))
  .orderBy(asc(projects.dueDate))
  .limit(5);
```

## 完了条件

- [ ] ログイン後にダッシュボードが表示される
- [ ] 案件数サマリーカードが正しい件数を表示する
- [ ] 進行状況バーグラフが表示される
- [ ] 自分の担当案件・タスクが表示される
- [ ] サマリーカードクリックで案件一覧の絞り込みに遷移する
- [ ] データが 0 件のときに適切な空状態が表示される
- [ ] `pnpm -w validate:check` と `pnpm -w build` が通る
