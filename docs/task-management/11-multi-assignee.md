# チケット 11: 案件・タスクの複数担当者対応

## 概要

案件（projects）とタスク（tasks）の担当者を、現在の 1 対 1 から多対多構造に変更する。
登録・編集フォームでは複数担当者をマルチセレクトで選択でき、一覧・詳細でも複数名を表示する。

## 背景

現状は `projects.assignee_id` / `tasks.assignee_id` の単一 FK で担当者を管理しているため、
複数人が担当する案件・タスクを正確に表現できない。
実際の業務では複数スタッフが共同担当するケースが多いため、中間テーブルによる多対多構造に移行する。

## 前提チケット

- チケット 04（案件管理）完了済み
- チケット 05（タスク管理）完了済み

## 実装内容

### 1. DB スキーマ変更

`packages/db/src/schema/projects.ts` から `assigneeId` 列を削除し、
`packages/db/src/schema/tasks.ts` から `assigneeId` 列を削除する。
代わりに中間テーブルを新設する。

#### `packages/db/src/schema/project-assignees.ts`（新規）

```ts
import { pgSchema, primaryKey, uuid } from "drizzle-orm/pg-core";
import { schemaName } from "../pgschema";
import { projectsTable } from "./projects";
import { staffsTable } from "./staff";

export const projectAssigneesTable = pgSchema(schemaName)
  .table(
    "project_assignees",
    {
      projectId: uuid("project_id")
        .notNull()
        .references(() => projectsTable.projectId, { onDelete: "cascade" }),
      staffId: uuid("staff_id")
        .notNull()
        .references(() => staffsTable.staffId, { onDelete: "cascade" }),
    },
    (t) => [primaryKey({ columns: [t.projectId, t.staffId] })],
  )
  .enableRLS();
```

#### `packages/db/src/schema/task-assignees.ts`（新規）

```ts
import { pgSchema, primaryKey, uuid } from "drizzle-orm/pg-core";
import { schemaName } from "../pgschema";
import { tasksTable } from "./tasks";
import { staffsTable } from "./staff";

export const taskAssigneesTable = pgSchema(schemaName)
  .table(
    "task_assignees",
    {
      taskId: uuid("task_id")
        .notNull()
        .references(() => tasksTable.taskId, { onDelete: "cascade" }),
      staffId: uuid("staff_id")
        .notNull()
        .references(() => staffsTable.staffId, { onDelete: "cascade" }),
    },
    (t) => [primaryKey({ columns: [t.taskId, t.staffId] })],
  )
  .enableRLS();
```

#### `packages/db/src/schema/index.ts` に追加エクスポート

```ts
export * from "./project-assignees";
export * from "./task-assignees";
```

#### マイグレーション実行

```bash
pnpm -w db:generate
pnpm -w db:migrate
```

---

### 2. 型定義変更

#### `apps/web/features/project/list/schema.ts`

`assigneeName` を `assignees` 配列に変更する。

```ts
// Before
export type ProjectsListItem = {
  assigneeName: string | null;
  createdAt: Date;
  dueDate: string | null;
  name: string;
  projectId: string;
};

// After
export type ProjectsListItem = {
  assignees: { id: string; name: string }[];
  createdAt: Date;
  dueDate: string | null;
  name: string;
  projectId: string;
};
```

#### `apps/web/features/task/list/get-tasks.ts`

`assigneeId` / `assigneeName` を `assignees` 配列に変更する。

```ts
// Before
export type TaskListItem = {
  assigneeId: string | null;
  assigneeName: string | null;
  ...
};

// After
export type TaskListItem = {
  assignees: { id: string; name: string }[];
  ...
};
```

#### `apps/web/features/project/detail/get-project-detail.ts`

```ts
// Before
type ProjectDetail = {
  assigneeId: string | null;
  assigneeName: string | null;
  ...
};

// After
type ProjectDetail = {
  assignees: { id: string; name: string }[];
  ...
};
```

---

### 3. バリデーションスキーマ変更

#### `apps/web/features/project/register/schema.ts`

```ts
// Before
export const registerProjectSchema = v.object({
  assigneeId: v.pipe(v.string(), v.uuid()),
  ...
});

// After
export const registerProjectSchema = v.object({
  assigneeIds: v.array(v.pipe(v.string(), v.uuid())),
  ...
});
```

#### `apps/web/features/project/edit/schema.ts`

```ts
// Before
export const editProjectSchema = v.object({
  assigneeId: v.pipe(v.string(), v.uuid()),
  ...
});

// After
export const editProjectSchema = v.object({
  assigneeIds: v.array(v.pipe(v.string(), v.uuid())),
  ...
});
```

#### `apps/web/features/task/register/schema.ts`

```ts
// Before
export const registerTaskSchema = v.object({
  assigneeId: v.pipe(v.string(), v.uuid()),
  ...
});

// After
export const registerTaskSchema = v.object({
  assigneeIds: v.array(v.pipe(v.string(), v.uuid())),
  ...
});
```

#### `apps/web/features/task/edit/schema.ts`

```ts
// Before
export const editTaskSchema = v.object({
  assigneeId: v.pipe(v.string(), v.uuid()),
  ...
});

// After
export const editTaskSchema = v.object({
  assigneeIds: v.array(v.pipe(v.string(), v.uuid())),
  ...
});
```

担当者は任意項目とし、0 人を許可する（`v.minLength` なし）。

---

### 4. データ取得ロジック変更

#### `apps/web/features/project/list/get-projects.ts`

`leftJoin(staffsTable)` を中間テーブル経由の `json_agg` に変更する。
担当者フィルタは `EXISTS` サブクエリで絞り込む。

```ts
import { projectAssigneesTable } from "@workspace/db/schema/project-assignees";
import { and, desc, eq, exists, ilike, sql } from "drizzle-orm";

// 担当者フィルタ
assigneeId
  ? exists(
      db
        .select()
        .from(projectAssigneesTable)
        .where(
          and(
            eq(projectAssigneesTable.projectId, projectsTable.projectId),
            eq(projectAssigneesTable.staffId, assigneeId),
          ),
        ),
    )
  : undefined,

// SELECT 列
assignees: sql<{ id: string; name: string }[]>`
  COALESCE(
    json_agg(
      json_build_object('id', ${staffsTable.staffId}, 'name', ${staffsTable.lastName} || ${staffsTable.firstName})
    ) FILTER (WHERE ${staffsTable.staffId} IS NOT NULL),
    '[]'
  )
`,

// FROM / JOIN
.from(projectsTable)
.leftJoin(
  projectAssigneesTable,
  eq(projectAssigneesTable.projectId, projectsTable.projectId),
)
.leftJoin(staffsTable, eq(projectAssigneesTable.staffId, staffsTable.staffId))
.groupBy(projectsTable.projectId)
```

#### `apps/web/features/task/list/get-tasks.ts`

同様に `taskAssigneesTable` 経由に変更する。

```ts
import { taskAssigneesTable } from "@workspace/db/schema/task-assignees";

// SELECT 列
assignees: sql<{ id: string; name: string }[]>`
  COALESCE(
    json_agg(
      json_build_object('id', ${staffsTable.staffId}, 'name', ${staffsTable.lastName} || ${staffsTable.firstName})
    ) FILTER (WHERE ${staffsTable.staffId} IS NOT NULL),
    '[]'
  )
`,

// FROM / JOIN
.from(tasksTable)
.leftJoin(
  taskAssigneesTable,
  eq(taskAssigneesTable.taskId, tasksTable.taskId),
)
.leftJoin(staffsTable, eq(taskAssigneesTable.staffId, staffsTable.staffId))
.where(eq(tasksTable.projectId, projectId))
.groupBy(tasksTable.taskId)
```

#### `apps/web/features/project/detail/get-project-detail.ts`

同様に `projectAssigneesTable` 経由に変更する。

---

### 5. 新規共通コンポーネント

#### `apps/web/features/user/assignee-multi-select.client.tsx`（新規）

Popover + Command（shadcn/ui）を使ったマルチセレクト UI。

```tsx
"use client";

import { Button } from "@workspace/ui/components/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@workspace/ui/components/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/components/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import { useState } from "react";
import { cn } from "@workspace/ui/lib/utils";
import type { UserOption } from "./list/get-user-options";

type AssigneeMultiSelectProps = {
  disabled?: boolean;
  onChange: (ids: string[]) => void;
  options: UserOption[];
  value: string[];
};

export function AssigneeMultiSelect({
  disabled,
  onChange,
  options,
  value,
}: AssigneeMultiSelectProps) {
  const [open, setOpen] = useState(false);

  function toggle(id: string) {
    if (value.includes(id)) {
      onChange(value.filter((v) => v !== id));
    } else {
      onChange([...value, id]);
    }
  }

  const label =
    value.length === 0
      ? "担当者を選択"
      : value.length === 1
        ? (options.find((o) => o.userId === value[0])?.fullName ?? "")
        : `${value.length}人選択中`;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          className="max-w-xs justify-between"
          disabled={disabled}
          role="combobox"
          type="button"
          variant="outline"
        >
          {label}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-0">
        <Command>
          <CommandInput placeholder="担当者を検索..." />
          <CommandList>
            <CommandEmpty>見つかりません</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.userId}
                  onSelect={() => toggle(option.userId)}
                  value={option.fullName}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value.includes(option.userId) ? "opacity-100" : "opacity-0",
                    )}
                  />
                  {option.fullName}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
```

#### `apps/web/features/user/assignees-display.universal.tsx`（新規）

最大 2 人まで表示し、残りは「+N 人」と表示する。0 人の場合は「-」を表示する。

```tsx
type AssigneesDisplayProps = {
  assignees: { id: string; name: string }[];
};

export function AssigneesDisplay({ assignees }: AssigneesDisplayProps) {
  if (assignees.length === 0) return <span>-</span>;

  const shown = assignees.slice(0, 2);
  const rest = assignees.length - shown.length;

  return (
    <span>
      {shown.map((a) => a.name).join("・")}
      {rest > 0 && ` +${rest}人`}
    </span>
  );
}
```

---

### 6. UIコンポーネント変更（登録・編集フォーム）

#### `apps/web/features/project/register/project-form.client.tsx`

- `assigneeId: v.pipe(v.string(), v.uuid(...))` → `assigneeIds: v.array(v.pipe(v.string(), v.uuid()))`
- `<Select>` → `<AssigneeMultiSelect>`
- `initialValues.assigneeId: string` → `initialValues.assigneeIds: string[]`
- `RequiredBadge` 削除（担当者は任意）

```tsx
// Before（フォームフィールド）
<FormField
  name="assigneeId"
  render={({ field }) => (
    <FormItem>
      <FormLabel className="flex items-center gap-2">
        担当者
        <RequiredBadge />
      </FormLabel>
      <Select defaultValue={field.value} onValueChange={field.onChange}>
        ...
      </Select>
    </FormItem>
  )}
/>

// After
<FormField
  name="assigneeIds"
  render={({ field }) => (
    <FormItem>
      <FormLabel>担当者</FormLabel>
      <AssigneeMultiSelect
        disabled={disabled}
        onChange={field.onChange}
        options={assigneeOptions}
        value={field.value}
      />
      <FormMessage />
    </FormItem>
  )}
/>
```

#### `apps/web/features/task/register/task-form.client.tsx` および編集フォームも同様に変更

---

### 7. 一覧・詳細表示の変更

#### `apps/web/features/project/list/projects.universal.tsx`

```tsx
// Before
<TableCell>{project.assigneeName ?? "-"}</TableCell>

// After
<TableCell>
  <AssigneesDisplay assignees={project.assignees} />
</TableCell>
```

#### `apps/web/features/task/list/tasks.universal.tsx`

```tsx
// Before
<TableCell>{task.assigneeName ?? "-"}</TableCell>

// After
<TableCell>
  <AssigneesDisplay assignees={task.assignees} />
</TableCell>
```

#### `apps/web/features/project/detail/project-basic-info.universal.tsx`

```tsx
// Before
{
  label: "担当者",
  value: project.assigneeName ?? "-",
},

// After
{
  label: "担当者",
  value: <AssigneesDisplay assignees={project.assignees} />,
},
```

---

### 8. Server Actions 変更

#### `apps/web/features/project/register/register-project.ts`

案件 INSERT 後、`projectAssigneesTable` に一括 INSERT する。

```ts
// Before
await db.insert(projectsTable).values({
  assigneeId: input.assigneeId,
  ...
}).returning(...);

// After
const [project] = await db
  .insert(projectsTable)
  .values({
    description: input.description,
    dueDate: input.dueDate,
    name: input.name,
  })
  .returning({ projectId: projectsTable.projectId });

if (!project) throw new Error("案件の登録に失敗しました");

if (input.assigneeIds.length > 0) {
  await db.insert(projectAssigneesTable).values(
    input.assigneeIds.map((staffId) => ({
      projectId: project.projectId,
      staffId,
    })),
  );
}
```

#### `apps/web/features/project/edit/edit-project.ts`

UPDATE 後、中間テーブルを洗い替え（全 DELETE → 再 INSERT）する。

```ts
import { eq } from "drizzle-orm";

// After
await db
  .update(projectsTable)
  .set({ description: input.description, dueDate: input.dueDate, name: input.name })
  .where(eq(projectsTable.projectId, input.projectId));

await db
  .delete(projectAssigneesTable)
  .where(eq(projectAssigneesTable.projectId, input.projectId));

if (input.assigneeIds.length > 0) {
  await db.insert(projectAssigneesTable).values(
    input.assigneeIds.map((staffId) => ({
      projectId: input.projectId,
      staffId,
    })),
  );
}
```

#### `apps/web/features/task/register/register-task.ts`

案件と同様に `taskAssigneesTable` に一括 INSERT する。

```ts
// After
await db.insert(tasksTable).values({
  description: input.description,
  dueDate: input.dueDate,
  name: input.name,
  projectId: input.projectId,
  status: input.status,
}).returning({ taskId: tasksTable.taskId });

if (input.assigneeIds.length > 0) {
  await db.insert(taskAssigneesTable).values(
    input.assigneeIds.map((staffId) => ({ taskId: task.taskId, staffId })),
  );
}
```

#### `apps/web/features/task/edit/edit-task.ts`

案件と同様に洗い替えする。

---

### 9. シードデータ更新

#### `packages/db/src/fixtures/projects.ts`

`assigneeId` フィールドを削除する。

```ts
// After
export const projectsFixture = [
  {
    description: "既存 EC サイトの UI/UX 改善と機能追加",
    dueDate: "2026-04-30",
    name: "ECサイトリニューアル",
    projectId: "10000000-0000-0000-0000-000000000001",
  },
  ...
];
```

#### `packages/db/src/fixtures/tasks.ts`

`assigneeId` フィールドを削除する。

#### `packages/db/src/fixtures/project-assignees.ts`（新規）

```ts
export const projectAssigneesFixture = [
  // ECサイトリニューアル: 田中太郎・山田花子
  { projectId: "10000000-0000-0000-0000-000000000001", staffId: "00000000-0000-0000-0000-000000000001" },
  { projectId: "10000000-0000-0000-0000-000000000001", staffId: "00000000-0000-0000-0000-000000000002" },
  // 社内管理システム構築: 山田花子
  { projectId: "10000000-0000-0000-0000-000000000002", staffId: "00000000-0000-0000-0000-000000000002" },
  // モバイルアプリ開発: 佐藤次郎
  { projectId: "10000000-0000-0000-0000-000000000003", staffId: "00000000-0000-0000-0000-000000000003" },
  // データ基盤整備: 田中太郎・佐藤次郎
  { projectId: "10000000-0000-0000-0000-000000000004", staffId: "00000000-0000-0000-0000-000000000001" },
  { projectId: "10000000-0000-0000-0000-000000000004", staffId: "00000000-0000-0000-0000-000000000003" },
];
```

#### `packages/db/src/fixtures/task-assignees.ts`（新規）

```ts
export const taskAssigneesFixture = [
  // 要件定義書の作成: 田中太郎
  { taskId: "20000000-0000-0000-0000-000000000001", staffId: "00000000-0000-0000-0000-000000000001" },
  // デザインカンプ作成: 山田花子・佐藤次郎
  { taskId: "20000000-0000-0000-0000-000000000002", staffId: "00000000-0000-0000-0000-000000000002" },
  { taskId: "20000000-0000-0000-0000-000000000002", staffId: "00000000-0000-0000-0000-000000000003" },
  // フロントエンド実装: 田中太郎
  { taskId: "20000000-0000-0000-0000-000000000003", staffId: "00000000-0000-0000-0000-000000000001" },
  // 現状業務フロー調査: 山田花子
  { taskId: "20000000-0000-0000-0000-000000000004", staffId: "00000000-0000-0000-0000-000000000002" },
  // DB 設計: 佐藤次郎
  { taskId: "20000000-0000-0000-0000-000000000005", staffId: "00000000-0000-0000-0000-000000000003" },
  // 認証機能実装: 山田花子・佐藤次郎
  { taskId: "20000000-0000-0000-0000-000000000006", staffId: "00000000-0000-0000-0000-000000000002" },
  { taskId: "20000000-0000-0000-0000-000000000006", staffId: "00000000-0000-0000-0000-000000000003" },
  // 技術選定: 佐藤次郎
  { taskId: "20000000-0000-0000-0000-000000000007", staffId: "00000000-0000-0000-0000-000000000003" },
  // プロトタイプ作成: 田中太郎
  { taskId: "20000000-0000-0000-0000-000000000008", staffId: "00000000-0000-0000-0000-000000000001" },
  // DWH 構築: 田中太郎
  { taskId: "20000000-0000-0000-0000-000000000009", staffId: "00000000-0000-0000-0000-000000000001" },
];
```

#### `packages/db/src/seed.ts`

新フィクスチャーを追加し、中間テーブルへの INSERT を案件・タスク INSERT の後に行う。

```ts
import { projectAssigneesFixture } from "./fixtures/project-assignees";
import { taskAssigneesFixture } from "./fixtures/task-assignees";

// 既存の projects・tasks INSERT の後に追加
await db.insert(projectAssigneesTable).values(projectAssigneesFixture);
await db.insert(taskAssigneesTable).values(taskAssigneesFixture);
```

---

### 10. テスト更新

以下の既存テストを、新しい型・スキーマに合わせて更新する。

- `apps/web/features/project/list/get-projects.medium.server.test.ts`
  - `assigneeName` → `assignees` 配列の検証に変更
- `apps/web/features/task/list/get-tasks.medium.server.test.ts`
  - 同様
- `apps/web/features/project/register/register-project.medium.server.test.ts`
  - `assigneeId` → `assigneeIds: [...]` に変更
- `apps/web/features/task/register/register-task.medium.server.test.ts`
  - 同様

#### 新規ブラウザテスト

`apps/web/features/user/assignee-multi-select.small.browser.test.tsx`（新規）

- 複数選択が正しく動作する
- 選択中の担当者にチェックが付く
- 0 件選択時は「担当者を選択」と表示される
- 2 件選択時は「2 人選択中」と表示される

`apps/web/features/user/assignees-display.small.browser.test.tsx`（新規）

- 0 人の場合「-」が表示される
- 1 人の場合その名前が表示される
- 2 人の場合「A・B」と表示される
- 3 人の場合「A・B +1人」と表示される

## 参考実装

- `packages/ui/src/components/command.tsx` - Command コンポーネント（マルチセレクト UI に使用）
- `packages/ui/src/components/popover.tsx` - Popover コンポーネント（マルチセレクト UI に使用）
- `apps/web/features/project/list/project-search-form.client.tsx` - Select の既存実装パターン
- `apps/web/features/project/register/register-project.ts` - INSERT パターン
- `apps/web/features/project/edit/edit-project.ts` - UPDATE パターン

## 完了条件

- [ ] `project_assignees` / `task_assignees` 中間テーブルが作成されている
- [ ] `projects.assignee_id` / `tasks.assignee_id` 列が削除されている
- [ ] 案件・タスクの登録フォームで複数担当者を選択できる
- [ ] 案件・タスクの編集フォームで複数担当者を変更できる
- [ ] 担当者 0 人で登録・編集できる
- [ ] 案件一覧・タスク一覧に複数担当者が表示される（最大 2 人 + 残数）
- [ ] 案件詳細に複数担当者が表示される
- [ ] 担当者フィルタ検索が正しく動作する（指定担当者が含まれる案件を絞り込む）
- [ ] シードデータが正常に投入できる（`pnpm -w db:reset` が通る）
- [ ] `pnpm -w validate:check` と `pnpm -w build` が通る
- [ ] テストが通る
- [ ] ブラウザでの動作確認・画面崩れがない
