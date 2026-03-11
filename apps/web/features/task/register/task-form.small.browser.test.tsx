import type React from "react";
import { expect, test, vi } from "vitest";
import { page } from "vitest/browser";
import { render } from "vitest-browser-react";
import { TaskForm } from "./task-form.client";

vi.mock("./register-task.action", () => ({
	registerTaskAction: vi.fn(),
}));

vi.mock("@/features/task/edit/edit-task.action", () => ({
	editTaskAction: vi.fn(),
}));

// Radix UI Select はブラウザテスト環境でクラッシュするためモック
vi.mock("@workspace/ui/components/select", () => ({
	Select: ({ children }: { children: React.ReactNode }) => <>{children}</>,
	SelectContent: ({ children }: { children: React.ReactNode }) => (
		<>{children}</>
	),
	SelectItem: ({ children }: { children: React.ReactNode }) => <>{children}</>,
	SelectTrigger: ({ children }: { children: React.ReactNode }) => (
		<div>{children}</div>
	),
	SelectValue: () => null,
}));

const assigneeOptions = [
	{ fullName: "田中太郎", userId: "00000000-0000-0000-0000-000000000001" },
];

const projectId = "00000000-0000-0000-0000-000000000001";

test("タスク名が空の場合、エラーが表示される", async () => {
	render(
		<TaskForm
			assigneeOptions={assigneeOptions}
			mode="register"
			projectId={projectId}
		/>,
	);

	await expect.element(page.getByLabelText("タスク名")).not.toBeDisabled();

	await page.getByRole("button", { name: "登録する" }).click();

	await expect
		.element(page.getByText("タスク名を入力してください"))
		.toBeInTheDocument();
});

test("登録ボタンが表示される", async () => {
	render(
		<TaskForm
			assigneeOptions={assigneeOptions}
			mode="register"
			projectId={projectId}
		/>,
	);

	await expect
		.element(page.getByRole("button", { name: "登録する" }))
		.toBeInTheDocument();
});
