import { randomUUID } from "node:crypto";
import { expect, type Page } from "@playwright/test";
import { createAdminClient } from "@repo/supabase/admin";
import { db } from "@workspace/db/client";
import { staffsTable } from "@workspace/db/schema/staff";
import { eq } from "drizzle-orm";
import { registerStaff } from "@/features/staff/register/register-staff";
import { testWithAuthenticated } from "./fixtures/authenticated-test";

const test = testWithAuthenticated.extend<{
	staffsPage: Page;
	testStaff: {
		email: string;
		firstName: string;
		lastName: string;
		staffId: string;
	};
}>({
	staffsPage: async ({ pageWithGenericUser: page }, use) => {
		await page.goto("/staffs");
		await page.waitForURL("/staffs");
		await expect(page.getByRole("main").getByText("読み込み中")).toBeHidden();

		await use(page);
	},
	// biome-ignore lint/correctness/noEmptyPattern: Playwrightのfixtureパターンで使用する標準的な記法
	async testStaff({}, use) {
		const uniqueId = randomUUID().slice(0, 8);
		const staffData = {
			email: `test-staff-${randomUUID()}@example.com`,
			firstName: `一覧用${uniqueId}`,
			lastName: `テスト${uniqueId}`,
			password: "TestStaff@123",
			role: "user" as const,
		};

		const result = await registerStaff(staffData);
		if (!result.success) {
			throw new Error(`テストスタッフの登録に失敗: ${result.error}`);
		}

		const staffId = result.data.staffId;

		await use({
			email: staffData.email,
			firstName: staffData.firstName,
			lastName: staffData.lastName,
			staffId,
		});

		// クリーンアップ: DB スタッフと Supabase Auth ユーザーの両方を削除
		const [staff] = await db
			.select({ authUserId: staffsTable.authUserId })
			.from(staffsTable)
			.where(eq(staffsTable.staffId, staffId));

		await db.delete(staffsTable).where(eq(staffsTable.staffId, staffId));

		if (staff?.authUserId) {
			const supabase = createAdminClient();
			await supabase.auth.admin.deleteUser(staff.authUserId);
		}
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

test("スタッフ一覧が表示される", async ({ staffsPage, testStaff }) => {
	await test.step("スタッフが表示されていることを確認", async () => {
		// テーブル行が読み込まれるまで待機
		await staffsPage.locator("table tbody tr").first().waitFor();
		const rows = staffsPage.locator("table tbody tr");
		const count = await rows.count();
		expect(count).toBeGreaterThan(0);
	});

	await test.step("姓、名が表示されていることを確認", async () => {
		// fixtureで作成したテスト用スタッフを検索で探す（ページネーション対策）
		await staffsPage
			.getByRole("main")
			.getByLabel("キーワード")
			.fill(testStaff.lastName);
		await staffsPage.getByRole("button", { name: "検索" }).click();
		await staffsPage.waitForURL("**/staffs?keyword=*");
		await expect(
			staffsPage.getByRole("main").getByText("読み込み中"),
		).toHaveCount(0);

		const targetRow = staffsPage
			.locator("table tbody tr")
			.filter({ hasText: testStaff.lastName })
			.filter({ hasText: testStaff.firstName });
		await expect(targetRow).toBeVisible();
		await expect(
			targetRow.getByRole("cell", { name: testStaff.lastName }),
		).toBeVisible();
		await expect(
			targetRow.getByRole("cell", { name: testStaff.firstName }),
		).toBeVisible();
	});
});

test("姓で完全一致検索できる", async ({ staffsPage, testStaff }) => {
	await test.step("姓を入力して検索", async () => {
		await staffsPage
			.getByRole("main")
			.getByLabel("キーワード")
			.fill(testStaff.lastName);
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
			staffsPage.getByRole("cell", { name: testStaff.lastName }),
		).toBeVisible();
	});
});

test("名で完全一致検索できる", async ({ staffsPage, testStaff }) => {
	await test.step("名を入力して検索", async () => {
		await staffsPage
			.getByRole("main")
			.getByLabel("キーワード")
			.fill(testStaff.firstName);
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
			staffsPage.getByRole("cell", { name: testStaff.firstName }),
		).toBeVisible();
	});
});

test("部分一致では検索されない", async ({ staffsPage }) => {
	const searchKeyword = "田";

	await test.step("部分的なキーワードで検索", async () => {
		await staffsPage
			.getByRole("main")
			.getByLabel("キーワード")
			.fill(searchKeyword);
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
		await staffsPage
			.getByRole("main")
			.getByLabel("キーワード")
			.fill("存在しないスタッフ");
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
