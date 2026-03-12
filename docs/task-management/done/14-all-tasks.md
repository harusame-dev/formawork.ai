# チケット14: プロジェクト横断タスク一覧画面

## 概要

全プロジェクトのタスクを横断的に表示するタスク一覧画面（`/tasks`）を新設する。
サイドメニューから直接アクセスでき、プロジェクト名カラムを含むテーブルで全タスクを表示する。
フィルタリング機能は対象外。

## 実装内容

### 1. サイドメニュー追加

- `navigation-menu.client.tsx` に「タスク一覧」→ `/tasks` リンクを追加（案件一覧の下）

### 2. 新規ページ

- `apps/web/app/(private)/tasks/page.tsx`

### 3. DBクエリ追加

- `features/task/list/get-all-tasks.ts`（新規）
- `tasksTable` + `staffsTable`(LEFT JOIN) + `projectsTable`(JOIN) でプロジェクト名を取得
- 返却型 `AllTaskListItem` にプロジェクト名（`projectName`）を追加

### 4. 表示コンポーネント追加

- `features/task/list/all-tasks.server.tsx`（新規）
- `features/task/list/all-tasks.universal.tsx`（新規）
- 既存 `tasks.universal.tsx` の列構成にプロジェクト名列を先頭追加
- プロジェクト名はプロジェクト詳細（`/projects/[projectId]`）へのリンク

## 表示カラム

プロジェクト名 / タスク名 / ステータス / 担当者 / 期限 / 操作

## 完了条件

- `/tasks` ページで全プロジェクトのタスク一覧が表示される
- プロジェクト名カラムがリンクになっている
- サイドメニューに「タスク一覧」が追加されている
- `pnpm -w validate:check` と `pnpm -w build` が通る
