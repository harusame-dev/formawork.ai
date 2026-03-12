# チケット 13: プロジェクト進捗表示機能

## 概要

プロジェクト一覧・詳細画面に進捗率（完了タスク数/総タスク数 %）を表示する機能を追加する。

## 背景

現在のプロジェクト一覧・詳細画面にはタスクの進捗情報が表示されていない。
プロジェクトの完了具合を一目で把握できるよう、進捗率と内訳（完了数/総数）を表示する。

## 前提チケット

- チケット 05（タスク管理機能）完了済み

## 実装内容

### 表示形式

```
50%  (5 / 10)
```

- `50%` : 大きめのフォントで表示
- `(5 / 10)` : sm サイズのフォントで表示

タスクが 0 件の場合は `0% (0 / 0)` と表示する。

### データ取得の変更

#### `features/project/list/get-projects.ts`

`tasks` テーブルとの集計 JOIN を追加し、各プロジェクトの進捗情報を返す。

```typescript
// SELECT に追加するフィールド
totalTasks: sql<number>`count(${tasksTable.taskId})`,
doneTasks: sql<number>`count(CASE WHEN ${tasksTable.status} = 'done' THEN 1 END)`,
```

```typescript
// JOIN を追加
.leftJoin(tasksTable, eq(projectsTable.projectId, tasksTable.projectId))
.groupBy(projectsTable.projectId, staffsTable.staffId)
```

`ProjectsListItem` 型に `totalTasks: number` と `doneTasks: number` を追加する。

#### `features/project/detail/get-project-detail.ts`

同様に `tasks` テーブルとの集計 JOIN を追加する。

```typescript
// SELECT に追加するフィールド
totalTasks: sql<number>`count(${tasksTable.taskId})`,
doneTasks: sql<number>`count(CASE WHEN ${tasksTable.status} = 'done' THEN 1 END)`,
```

`ProjectDetail` 型に `totalTasks: number` と `doneTasks: number` を追加する。

### UI の変更

#### `features/project/list/projects.universal.tsx`

テーブルに「進捗」列を追加する。

```tsx
<TableHead>進捗</TableHead>

// TableCell 内
<span className="text-base font-semibold">
  {total === 0 ? 0 : Math.round((done / total) * 100)}%
</span>
<span className="text-sm text-muted-foreground ml-1">
  ({done} / {total})
</span>
```

#### `features/project/detail/project-basic-info.universal.tsx`

基本情報エリアに進捗の行を追加する。

```tsx
<dt>進捗</dt>
<dd>
  <span className="text-base font-semibold">
    {total === 0 ? 0 : Math.round((done / total) * 100)}%
  </span>
  <span className="text-sm text-muted-foreground ml-1">
    ({done} / {total})
  </span>
</dd>
```

### キャッシュの変更

#### `features/task/status/update-task-status.action.ts`

タスクのステータス変更はプロジェクトの進捗率に影響するため、`onSuccess` 時に `ProjectTag.List` と `ProjectTag.Detail` も無効化する。

```typescript
onSuccess: ({ input }) => {
  updateTag(TaskTag.List(input.projectId));
  updateTag(TaskTag.Detail(input.taskId));
  updateTag(ProjectTag.List);
  updateTag(ProjectTag.Detail(input.projectId));
},
```

## 完了条件

- [ ] プロジェクト一覧の表に「進捗」列が表示される
- [ ] プロジェクト詳細の基本情報エリアに進捗情報が表示される
- [ ] 表示形式が `XX%` (大) + `(完了数 / 総数)` (sm) である
- [ ] タスクが 0 件の場合は `0% (0 / 0)` と表示される
- [ ] タスクのステータス変更後にプロジェクト一覧・詳細の進捗率が更新される
- [ ] `pnpm -w validate:check` と `pnpm -w build` が通る
