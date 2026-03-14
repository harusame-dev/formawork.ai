import { expect, test, vi } from "vitest";
import { page } from "vitest/browser";
import { render } from "vitest-browser-react";
import { DeleteProjectDialog } from "./delete-project-dialog.client";

vi.mock("./delete-project.action", () => ({
	deleteProjectAction: vi.fn(),
}));

test("削除ボタンをクリックするとダイアログが表示される", async () => {
	render(
		<DeleteProjectDialog projectId="00000000-0000-0000-0000-000000000001" />,
	);

	await page.getByRole("button", { name: "削除" }).click();

	const dialog = page.getByRole("dialog");
	await expect.element(dialog).toBeInTheDocument();
	await expect
		.element(dialog.getByRole("heading", { name: "プロジェクトを削除" }))
		.toBeInTheDocument();
	await expect
		.element(
			dialog.getByText(
				"プロジェクトを削除してもよろしいですか？この操作は取り消せません。",
			),
		)
		.toBeInTheDocument();
});

test("キャンセルボタンをクリックするとダイアログが閉じる", async () => {
	render(
		<DeleteProjectDialog projectId="00000000-0000-0000-0000-000000000001" />,
	);

	await page.getByRole("button", { name: "削除" }).click();

	const dialog = page.getByRole("dialog");
	await expect.element(dialog).toBeInTheDocument();

	await dialog.getByRole("button", { name: "キャンセル" }).click();

	await expect.element(dialog).not.toBeInTheDocument();
});
