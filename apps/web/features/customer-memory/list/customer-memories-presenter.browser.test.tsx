import { MemoryCategory } from "@workspace/db/schema/customer-memory";
import { expect, test, vi } from "vitest";
import { page } from "vitest/browser";
import { render } from "vitest-browser-react";
import { CustomerMemoriesPresenter } from "./customer-memories-presenter";

vi.mock("../toggle-lock/toggle-customer-memory-lock-action", () => ({
	toggleCustomerMemoryLockAction: vi.fn(),
}));

const TEST_CUSTOMER_ID = "test-customer-id";

const createMockMemory = (
	id: string,
	category: number,
	content: string,
	importance: number,
	isLocked = false,
) => ({
	category,
	content,
	createdAt: new Date(),
	customerId: TEST_CUSTOMER_ID,
	id,
	importance,
	isLocked,
	sourceNoteId: null,
	updatedAt: new Date(),
});

test("100行分表示される", { timeout: 5000 }, async () => {
	const memories = [
		createMockMemory("1", MemoryCategory.Personal, "テスト内容1", 5),
		createMockMemory("2", MemoryCategory.Preference, "テスト内容2", 7),
		createMockMemory("3", MemoryCategory.Conversion, "テスト内容3", 8),
	];

	render(
		<CustomerMemoriesPresenter
			customerId={TEST_CUSTOMER_ID}
			memories={memories}
		/>,
	);

	const table = page.getByRole("table");
	await expect.element(table).toBeInTheDocument();

	// ヘッダー行1つ + データ行100 = 101行
	const rows = page.getByRole("row");
	const allRows = await rows.all();
	expect(allRows).toHaveLength(101);
});

test("未登録行は内容が「-」で表示される", async () => {
	const memories = [
		createMockMemory("1", MemoryCategory.Personal, "登録済み内容", 5),
	];

	render(
		<CustomerMemoriesPresenter
			customerId={TEST_CUSTOMER_ID}
			memories={memories}
		/>,
	);

	// 登録済みの行が表示されていること
	await expect.element(page.getByText("登録済み内容")).toBeInTheDocument();

	// 未登録行（2行目）の番号と「-」が表示されることを確認
	// 未登録行はカテゴリ、内容、重要度が「-」になる
	await expect.element(page.getByRole("row").nth(2)).toBeInTheDocument();
	// 空のメモリがあれば「-」が表示されている
	await expect
		.element(page.getByRole("cell", { name: "-" }).first())
		.toBeInTheDocument();
});

test("テーブルヘッダーが正しく表示される", async () => {
	const memories: ReturnType<typeof createMockMemory>[] = [];

	render(
		<CustomerMemoriesPresenter
			customerId={TEST_CUSTOMER_ID}
			memories={memories}
		/>,
	);

	await expect
		.element(page.getByRole("columnheader", { name: "#" }))
		.toBeInTheDocument();
	await expect
		.element(page.getByRole("columnheader", { name: "ロック" }))
		.toBeInTheDocument();
	await expect
		.element(page.getByRole("columnheader", { name: "カテゴリ" }))
		.toBeInTheDocument();
	await expect
		.element(page.getByRole("columnheader", { name: "内容" }))
		.toBeInTheDocument();
	await expect
		.element(page.getByRole("columnheader", { name: "重要度" }))
		.toBeInTheDocument();
});

test("カテゴリと重要度が正しく表示される", async () => {
	const memories = [
		createMockMemory("1", MemoryCategory.Personal, "パーソナル内容", 5),
		createMockMemory("2", MemoryCategory.Preference, "好みの内容", 8),
	];

	render(
		<CustomerMemoriesPresenter
			customerId={TEST_CUSTOMER_ID}
			memories={memories}
		/>,
	);

	// カテゴリラベルが表示される
	await expect.element(page.getByText("パーソナル情報")).toBeInTheDocument();
	await expect
		.element(page.getByText("趣味趣向", { exact: true }))
		.toBeInTheDocument();

	// 内容が表示される
	await expect.element(page.getByText("パーソナル内容")).toBeInTheDocument();
	await expect.element(page.getByText("好みの内容")).toBeInTheDocument();
});
