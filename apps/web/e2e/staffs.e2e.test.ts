import { expect, type Page } from "@playwright/test";
import { testWithAuthenticated } from "./fixtures/authenticated-test";

const test = testWithAuthenticated.extend<{
	staffsPage: Page;
}>({
	staffsPage: async ({ pageWithGenericUser: page }, use) => {
		await page.goto("/staffs");
		await page.waitForURL("/staffs");
		await expect(page.getByRole("main").getByText("読み込み中")).toBeHidden();

		await use(page);
	},
});

test("メニューからスタッフ一覧ページに遷移できる", async ({
	pageWithGenericUser: page,
}) => {
	await test.step("メニューボタンをクリックしてメニューを開く", async () => {
		await page.getByRole("button", { name: /^メニューを開く$/ }).click();
	});

	await test.step("スタッフ一覧リンクをクリック", async () => {
		await page.getByRole("link", { name: "スタッフ一覧" }).click();
	});

	await test.step("スタッフ一覧ページに遷移することを確認", async () => {
		await expect(page).toHaveURL("/staffs");
		await expect(
			page.getByRole("heading", { name: "スタッフ一覧" }),
		).toBeVisible();
	});
});

test("スタッフ一覧が表示される", async ({ staffsPage }) => {
	await test.step("スタッフが表示されていることを確認", async () => {
		const rows = staffsPage.locator("table tbody tr");
		const count = await rows.count();
		expect(count).toBeGreaterThan(0);
	});

	await test.step("姓、名とメールアドレスが表示されていることを確認", async () => {
		const targetRow = staffsPage
			.locator("table tbody tr")
			.filter({ hasText: "田中" })
			.filter({ hasText: "太郎" });
		await expect(targetRow).toBeVisible();
		await expect(targetRow.getByRole("cell", { name: "田中" })).toBeVisible();
		await expect(targetRow.getByRole("cell", { name: "太郎" })).toBeVisible();
	});
});

test("姓で完全一致検索できる", async ({ staffsPage }) => {
	const searchKeyword = "田中";

	await test.step("姓を入力して検索", async () => {
		await staffsPage.getByLabel("キーワード").fill(searchKeyword);
		await staffsPage.getByRole("button", { name: "検索" }).click();
		await staffsPage.waitForURL("**/staffs?keyword=*");
		await expect(
			staffsPage.getByRole("main").getByText("読み込み中"),
		).toBeHidden();
	});

	await test.step("検索結果を確認", async () => {
		const rows = staffsPage.locator("table tbody tr");
		const count = await rows.count();
		expect(count).toBeGreaterThan(0);
		await expect(
			staffsPage.getByRole("cell", { name: searchKeyword }),
		).toBeVisible();
	});
});

test("名で完全一致検索できる", async ({ staffsPage }) => {
	const searchKeyword = "太郎";

	await test.step("名を入力して検索", async () => {
		await staffsPage.getByLabel("キーワード").fill(searchKeyword);
		await staffsPage.getByRole("button", { name: "検索" }).click();
		await staffsPage.waitForURL("**/staffs?keyword=*");
		await expect(
			staffsPage.getByRole("main").getByText("読み込み中"),
		).toBeHidden();
	});

	await test.step("検索結果を確認", async () => {
		const rows = staffsPage.locator("table tbody tr");
		const count = await rows.count();
		expect(count).toBeGreaterThan(0);
		await expect(
			staffsPage.getByRole("cell", { name: searchKeyword }),
		).toBeVisible();
	});
});

test("部分一致では検索されない", async ({ staffsPage }) => {
	const searchKeyword = "田";

	await test.step("部分的なキーワードで検索", async () => {
		await staffsPage.getByLabel("キーワード").fill(searchKeyword);
		await staffsPage.getByRole("button", { name: "検索" }).click();
		await staffsPage.waitForURL("**/staffs?keyword=*");
		await expect(
			staffsPage.getByRole("main").getByText("読み込み中"),
		).toBeHidden();
	});

	await test.step("検索結果がないことを確認", async () => {
		await expect(
			staffsPage.getByText("スタッフが見つかりませんでした"),
		).toBeVisible();
	});
});

test("該当するスタッフがいない場合、メッセージが表示される", async ({
	staffsPage,
}) => {
	await test.step("存在しないキーワードで検索", async () => {
		await staffsPage.getByLabel("キーワード").fill("存在しないスタッフ");
		await staffsPage.getByRole("button", { name: "検索" }).click();
		await staffsPage.waitForURL("**/staffs?keyword=*");
		await expect(
			staffsPage.getByRole("main").getByText("読み込み中"),
		).toBeHidden();
	});

	await test.step("メッセージを確認", async () => {
		await expect(
			staffsPage.getByText("スタッフが見つかりませんでした"),
		).toBeVisible();
	});
});
