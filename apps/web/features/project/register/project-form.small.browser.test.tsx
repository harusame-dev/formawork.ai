import { expect, test, vi } from "vitest";
import { page } from "vitest/browser";
import { render } from "vitest-browser-react";
import { ProjectForm } from "./project-form.client";

vi.mock("./register-project.action", () => ({
	registerProjectAction: vi.fn(),
}));

vi.mock("@/features/project/edit/edit-project.action", () => ({
	editProjectAction: vi.fn(),
}));

// AssigneeMultiSelect はブラウザテスト環境でのPopoverをモック
vi.mock("@/features/user/assignee-multi-select.client", () => ({
	AssigneeMultiSelect: ({
		onChange,
		value,
	}: {
		onChange: (v: string[]) => void;
		value: string[];
	}) => (
		<button onClick={() => onChange(value)} type="button">
			担当者選択
		</button>
	),
}));

const assigneeOptions = [
	{ fullName: "田中太郎", userId: "00000000-0000-0000-0000-000000000001" },
	{ fullName: "鈴木花子", userId: "00000000-0000-0000-0000-000000000002" },
];

test("プロジェクト名が空の場合、エラーが表示される", async () => {
	render(<ProjectForm assigneeOptions={assigneeOptions} mode="register" />);

	await expect.element(page.getByLabelText("プロジェクト名")).not.toBeDisabled();

	await page.getByRole("button", { name: "登録する" }).click();

	await expect
		.element(page.getByText("プロジェクト名を入力してください"))
		.toBeInTheDocument();
});

test("登録ボタンが表示される", async () => {
	render(<ProjectForm assigneeOptions={assigneeOptions} mode="register" />);

	await expect
		.element(page.getByRole("button", { name: "登録する" }))
		.toBeInTheDocument();
});

test("編集モードでは編集するボタンが表示される", async () => {
	render(
		<ProjectForm
			assigneeOptions={assigneeOptions}
			initialValues={{
				assigneeIds: ["00000000-0000-0000-0000-000000000001"],
				description: null,
				dueDate: null,
				name: "既存プロジェクト",
			}}
			mode="edit"
			projectId="00000000-0000-0000-0000-000000000001"
		/>,
	);

	await expect
		.element(page.getByRole("button", { name: "編集する" }))
		.toBeInTheDocument();
});
