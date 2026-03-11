import { randomUUID } from "node:crypto";
import { expect, type Page } from "@playwright/test";
import { createAdminClient } from "@repo/supabase/admin";
import { db } from "@workspace/db/client";
import { staffsTable } from "@workspace/db/schema/staff";
import { eq } from "drizzle-orm";
import { registerUser } from "@/features/user/register/register-user";
import { testWithAuthenticated } from "./fixtures/authenticated-test";

const test = testWithAuthenticated.extend<{
	usersPage: Page;
	testUser: {
		email: string;
		firstName: string;
		lastName: string;
		userId: string;
	};
}>({
	// biome-ignore lint/correctness/noEmptyPattern: Playwrightのfixtureパターンで使用する標準的な記法
	async testUser({}, use) {
		const uniqueId = randomUUID().slice(0, 8);
		const userData = {
			email: `test-user-${randomUUID()}@example.com`,
			firstName: `一覧用${uniqueId}`,
			lastName: `テスト${uniqueId}`,
			password: "TestUser@123",
			role: "user" as const,
		};

		const result = await registerUser(userData);
		if (!result.success) {
			throw new Error(`テストユーザーの登録に失敗: ${result.error}`);
		}

		const userId = result.data.userId;

		await use({
			email: userData.email,
			firstName: userData.firstName,
			lastName: userData.lastName,
			userId,
		});

		// クリーンアップ: DB スタッフと Supabase Auth ユーザーの両方を削除
		const [user] = await db
			.select({ authUserId: staffsTable.authUserId })
			.from(staffsTable)
			.where(eq(staffsTable.staffId, userId));

		await db.delete(staffsTable).where(eq(staffsTable.staffId, userId));

		if (user?.authUserId) {
			const supabase = createAdminClient();
			await supabase.auth.admin.deleteUser(user.authUserId);
		}
	},
	usersPage: async ({ pageWithGenericUser: page }, use) => {
		await page.goto("/users");
		await page.waitForURL("/users");
		await expect(page.getByRole("main").getByText("読み込み中")).toBeHidden();

		await use(page);
	},
});

test("メニューからユーザー一覧ページに遷移できる", async ({
	pageWithGenericUser: page,
}) => {
	await test.step("メニューボタンをクリックしてメニューを開く", async () => {
		await page.getByRole("button", { name: /^メニューを開く$/ }).click();
	});

	await test.step("ユーザー一覧リンクをクリック", async () => {
		await page.getByRole("link", { name: "ユーザー一覧" }).click();
	});

	await test.step("ユーザー一覧ページに遷移することを確認", async () => {
		await expect(page).toHaveURL("/users");
		await expect(
			page.getByRole("heading", { name: "ユーザー一覧" }),
		).toBeVisible();
	});
});

test("ユーザー一覧が表示される", async ({ usersPage, testUser }) => {
	await test.step("ユーザーが表示されていることを確認", async () => {
		// テーブル行が読み込まれるまで待機
		await usersPage.locator("table tbody tr").first().waitFor();
		const rows = usersPage.locator("table tbody tr");
		const count = await rows.count();
		expect(count).toBeGreaterThan(0);
	});

	await test.step("姓、名が表示されていることを確認", async () => {
		// fixtureで作成したテスト用ユーザーを検索で探す（ページネーション対策）
		await usersPage
			.getByRole("main")
			.getByLabel("キーワード")
			.fill(testUser.lastName);
		await usersPage.getByRole("button", { name: "検索" }).click();
		await usersPage.waitForURL("**/users?keyword=*");
		await expect(
			usersPage.getByRole("main").getByText("読み込み中"),
		).toHaveCount(0);

		const targetRow = usersPage
			.locator("table tbody tr")
			.filter({ hasText: testUser.lastName })
			.filter({ hasText: testUser.firstName });
		await expect(targetRow).toBeVisible();
		await expect(
			targetRow.getByRole("cell", { name: testUser.lastName }),
		).toBeVisible();
		await expect(
			targetRow.getByRole("cell", { name: testUser.firstName }),
		).toBeVisible();
	});
});

test("姓で完全一致検索できる", async ({ usersPage, testUser }) => {
	await test.step("姓を入力して検索", async () => {
		await usersPage
			.getByRole("main")
			.getByLabel("キーワード")
			.fill(testUser.lastName);
		await usersPage.getByRole("button", { name: "検索" }).click();
		await usersPage.waitForURL("**/users?keyword=*");
		await expect(
			usersPage.getByRole("main").getByText("読み込み中"),
		).toBeHidden();
	});

	await test.step("検索結果を確認", async () => {
		const rows = usersPage.locator("table tbody tr");
		const count = await rows.count();
		expect(count).toBeGreaterThan(0);
		await expect(
			usersPage.getByRole("cell", { name: testUser.lastName }),
		).toBeVisible();
	});
});

test("名で完全一致検索できる", async ({ usersPage, testUser }) => {
	await test.step("名を入力して検索", async () => {
		await usersPage
			.getByRole("main")
			.getByLabel("キーワード")
			.fill(testUser.firstName);
		await usersPage.getByRole("button", { name: "検索" }).click();
		await usersPage.waitForURL("**/users?keyword=*");
		await expect(
			usersPage.getByRole("main").getByText("読み込み中"),
		).toBeHidden();
	});

	await test.step("検索結果を確認", async () => {
		const rows = usersPage.locator("table tbody tr");
		const count = await rows.count();
		expect(count).toBeGreaterThan(0);
		await expect(
			usersPage.getByRole("cell", { name: testUser.firstName }),
		).toBeVisible();
	});
});

test("部分一致では検索されない", async ({ usersPage }) => {
	const searchKeyword = "田";

	await test.step("部分的なキーワードで検索", async () => {
		await usersPage
			.getByRole("main")
			.getByLabel("キーワード")
			.fill(searchKeyword);
		await usersPage.getByRole("button", { name: "検索" }).click();
		await usersPage.waitForURL("**/users?keyword=*");
		await expect(
			usersPage.getByRole("main").getByText("読み込み中"),
		).toBeHidden();
	});

	await test.step("検索結果がないことを確認", async () => {
		await expect(
			usersPage.getByText("ユーザーが見つかりませんでした"),
		).toBeVisible();
	});
});

test("該当するユーザーがいない場合、メッセージが表示される", async ({
	usersPage,
}) => {
	await test.step("存在しないキーワードで検索", async () => {
		await usersPage
			.getByRole("main")
			.getByLabel("キーワード")
			.fill("存在しないユーザー");
		await usersPage.getByRole("button", { name: "検索" }).click();
		await usersPage.waitForURL("**/users?keyword=*");
		await expect(
			usersPage.getByRole("main").getByText("読み込み中"),
		).toBeHidden();
	});

	await test.step("メッセージを確認", async () => {
		await expect(
			usersPage.getByText("ユーザーが見つかりませんでした"),
		).toBeVisible();
	});
});
