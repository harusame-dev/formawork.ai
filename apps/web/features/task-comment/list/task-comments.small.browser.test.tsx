import { expect, test, vi } from "vitest";
import { page } from "vitest/browser";
import { render } from "vitest-browser-react";
import { TaskCommentsPresenter } from "./task-comments.universal";

vi.mock("../edit/edit-task-comment-dialog.client", () => ({
	EditTaskCommentDialog: () => <button type="button">編集</button>,
}));

vi.mock("../delete/delete-task-comment-dialog.client", () => ({
	DeleteTaskCommentDialog: () => <button type="button">削除</button>,
}));

const baseComment = {
	authorId: "00000000-0000-0000-0000-000000000001",
	authorName: "田中太郎",
	commentId: "30000000-0000-0000-0000-000000000001",
	content: "テストコメント内容",
	createdAt: new Date("2026-01-01T00:00:00Z"),
	taskId: "20000000-0000-0000-0000-000000000001",
	updatedAt: new Date("2026-01-01T00:00:00Z"),
};

test("コメントが0件の場合、空状態メッセージが表示される", async () => {
	render(
		<TaskCommentsPresenter
			comments={[]}
			currentRole="user"
			currentStaffId="00000000-0000-0000-0000-000000000001"
		/>,
	);

	await expect
		.element(page.getByText("コメントはありません"))
		.toBeInTheDocument();
});

test("コメント一覧が正しくレンダリングされる", async () => {
	render(
		<TaskCommentsPresenter
			comments={[baseComment]}
			currentRole="user"
			currentStaffId="00000000-0000-0000-0000-000000000001"
		/>,
	);

	await expect
		.element(page.getByText("テストコメント内容"))
		.toBeInTheDocument();
	await expect.element(page.getByText("田中太郎")).toBeInTheDocument();
});

test("currentStaffId が authorId と一致する場合、編集・削除ボタンが表示される", async () => {
	render(
		<TaskCommentsPresenter
			comments={[baseComment]}
			currentRole="user"
			currentStaffId="00000000-0000-0000-0000-000000000001"
		/>,
	);

	await expect
		.element(page.getByRole("button", { name: "編集" }))
		.toBeInTheDocument();
	await expect
		.element(page.getByRole("button", { name: "削除" }))
		.toBeInTheDocument();
});

test("異なる currentStaffId（かつ非管理者）の場合、編集・削除ボタンが表示されない", async () => {
	render(
		<TaskCommentsPresenter
			comments={[baseComment]}
			currentRole="user"
			currentStaffId="00000000-0000-0000-0000-000000000002"
		/>,
	);

	await expect
		.element(page.getByRole("button", { name: "編集" }))
		.not.toBeInTheDocument();
	await expect
		.element(page.getByRole("button", { name: "削除" }))
		.not.toBeInTheDocument();
});

test("currentRole が admin の場合、他人のコメントにも編集・削除ボタンが表示される", async () => {
	render(
		<TaskCommentsPresenter
			comments={[baseComment]}
			currentRole="admin"
			currentStaffId="00000000-0000-0000-0000-000000000002"
		/>,
	);

	await expect
		.element(page.getByRole("button", { name: "編集" }))
		.toBeInTheDocument();
	await expect
		.element(page.getByRole("button", { name: "削除" }))
		.toBeInTheDocument();
});
