import { expect, test } from "vitest";
import { page } from "vitest/browser";
import { render } from "vitest-browser-react";
import { TaskStatusBadge } from "./task-status-badge.universal";

test("未着手のバッジが表示される", async () => {
	render(<TaskStatusBadge status="todo" />);

	await expect.element(page.getByText("未着手")).toBeInTheDocument();
});

test("進行中のバッジが表示される", async () => {
	render(<TaskStatusBadge status="in_progress" />);

	await expect.element(page.getByText("進行中")).toBeInTheDocument();
});

test("完了のバッジが表示される", async () => {
	render(<TaskStatusBadge status="done" />);

	await expect.element(page.getByText("完了")).toBeInTheDocument();
});
