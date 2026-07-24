// SessionStart hook: ブランチ名(例 worktree-Masaharu-Nemoto-CU-86eyaezjx)から ClickUp チケット ID を
// 抽出し、REST API で内容を取得してセッションに注入する。
// 失敗時は何も出力せず正常終了する（SessionStart をブロックしないため）。
import { $ } from "bun";

type ClickUpTask = {
  name?: string;
  status?: { status?: string };
  url?: string;
  assignees?: { username?: string }[];
  description?: string;
};

const apiKey = process.env.CLICKUP_API_KEY;
if (!apiKey) process.exit(0);

const branch = (
  await $`git rev-parse --abbrev-ref HEAD`.quiet().nothrow().text()
).trim();
if (!branch) process.exit(0);

const ticketId = branch.match(/CU-[a-z0-9]+/i)?.[0];
if (!ticketId) process.exit(0);

// "CU-" はブランチ命名上のプレフィックスで ClickUp の custom task ID ではない。
// 素の ID (例 86eyd9re1) がそのまま ClickUp 標準タスク ID なので剥がして使う。
const taskId = ticketId.slice("CU-".length);

const response = await fetch(
  `https://api.clickup.com/api/v2/task/${taskId}`,
  { headers: { Authorization: apiKey } },
).catch(() => undefined);
if (!response?.ok) process.exit(0);

const task = (await response.json().catch(() => undefined)) as
  | ClickUpTask
  | undefined;
if (!task?.name) process.exit(0);

const assignees = (task.assignees ?? [])
  .map((assignee) => assignee.username)
  .filter((username) => username !== undefined)
  .join(", ");

console.log(
  JSON.stringify({
    hookSpecificOutput: {
      hookEventName: "SessionStart",
      additionalContext: [
        `現在のブランチ(${branch})に対応するClickUpチケット ${ticketId} を検出。`,
        "",
        `タイトル: ${task.name}`,
        `ステータス: ${task.status?.status ?? ""}`,
        `担当: ${assignees}`,
        `URL: ${task.url ?? ""}`,
        "",
        "説明:",
        task.description ?? "",
      ].join("\n"),
    },
  }),
);
