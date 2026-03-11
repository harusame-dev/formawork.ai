import { expect, test, vi } from "vitest";
import { page } from "vitest/browser";
import { render } from "vitest-browser-react";
import type { UsersListItem } from "./schema";
import { UsersPresenter } from "./users.universal";

vi.mock("next/navigation", () => ({
	usePathname: vi.fn().mockReturnValue("path"),
	useRouter: vi.fn().mockReturnValue({
		push: vi.fn(),
	}),
	useSearchParams: vi.fn().mockReturnValue(new URLSearchParams()),
}));

const mockUsers: UsersListItem[] = [
	{
		email: "user1@example.com",
		firstName: "太郎",
		lastName: "田中",
		userId: "1",
	},
	{
		email: "user2@example.com",
		firstName: "花子",
		lastName: "鈴木",
		userId: "2",
	},
];

test("ユーザー一覧が表示される", async () => {
	render(<UsersPresenter page={1} totalPages={1} users={mockUsers} />);

	await expect.element(page.getByText("田中 太郎")).toBeInTheDocument();
	await expect.element(page.getByText("鈴木 花子")).toBeInTheDocument();
	await expect.element(page.getByText("user1@example.com")).toBeInTheDocument();
	await expect.element(page.getByText("user2@example.com")).toBeInTheDocument();
});

test("ユーザーが0件の場合、空のメッセージが表示される", async () => {
	render(<UsersPresenter page={1} totalPages={0} users={[]} />);

	await expect
		.element(page.getByText("ユーザーが見つかりませんでした"))
		.toBeInTheDocument();
});

test("ページネーションが表示される", async () => {
	render(<UsersPresenter page={2} totalPages={3} users={mockUsers} />);

	const paginationElement = page.getByRole("navigation");
	await expect.element(paginationElement).toBeInTheDocument();
});

test("ページネーションが1ページのみの場合全てのボタンがdisabled", async () => {
	render(<UsersPresenter page={1} totalPages={1} users={mockUsers} />);

	const paginationElement = page.getByRole("navigation");
	await expect.element(paginationElement).toBeInTheDocument();

	const previousButton = page.getByRole("link", { name: "前へ" });
	await expect.element(previousButton).toHaveAttribute("aria-disabled", "true");

	const pageButton = page.getByRole("link", {
		name: /^1$/,
	});
	await expect.element(pageButton).toHaveAttribute("aria-disabled", "true");

	const nextButton = page.getByRole("link", { name: "次へ" });
	await expect.element(nextButton).toHaveAttribute("aria-disabled", "true");
});
