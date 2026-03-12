import { expect, test, vi } from "vitest";
import { page } from "vitest/browser";
import { render } from "vitest-browser-react";
import { TaskDetailPresenter } from "./task-detail.universal";

vi.mock("@/features/task/status/task-status-select.client", () => ({
	TaskStatusSelect: ({ currentStatus }: { currentStatus: string }) => (
		<span>{currentStatus}</span>
	),
}));

const baseTask = {
	assigneeId: "00000000-0000-0000-0000-000000000001",
	assigneeName: "田中太郎",
	description: "テスト説明文",
	dueDate: "2026-12-31",
	name: "テストタスク",
	projectId: "00000000-0000-0000-0000-000000000002",
	status: "todo",
	taskId: "00000000-0000-0000-0000-000000000003",
};

test("担当者・期限・説明が正しく表示される", async () => {
	render(<TaskDetailPresenter task={baseTask} />);

	await expect.element(page.getByText("田中太郎")).toBeInTheDocument();
	await expect.element(page.getByText("2026-12-31")).toBeInTheDocument();
	await expect.element(page.getByText("テスト説明文")).toBeInTheDocument();
});

test("description が null の場合「説明なし」と表示される", async () => {
	render(<TaskDetailPresenter task={{ ...baseTask, description: null }} />);

	await expect.element(page.getByText("説明なし")).toBeInTheDocument();
});
