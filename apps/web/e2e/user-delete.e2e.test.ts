import { randomUUID } from "node:crypto";
import { expect } from "@playwright/test";
import { db } from "@workspace/db/client";
import { staffsTable } from "@workspace/db/schema/staff";
import { eq } from "drizzle-orm";
import { registerUser } from "@/features/user/register/register-user";
import { testWithAuthenticated } from "./fixtures/authenticated-test";

const test = testWithAuthenticated.extend<{
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
			firstName: `削除用${uniqueId}`,
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

		// クリーンアップ: 削除テストで削除されなかった場合に備えて
		await db.delete(staffsTable).where(eq(staffsTable.staffId, userId));
	},
});

test("管理者がユーザーを削除できる", async ({
	pageWithAdminUser: page,
	testUser,
}) => {
	await test.step("ユーザー詳細ページに遷移", async () => {
		await page.goto(`/users/${testUser.userId}`);
		await page.waitForURL(`/users/${testUser.userId}`);
		await expect(
			page.getByRole("heading", {
				name: `${testUser.lastName} ${testUser.firstName}`,
			}),
		).toBeVisible();
	});

	await test.step("削除実行", async () => {
		await page.getByRole("button", { name: "削除" }).click();
		await page
			.getByRole("dialog")
			.getByRole("button", { name: "削除" })
			.click();
		await page.waitForURL("/users");
	});

	await test.step("削除されたユーザーを検索してもヒットしないことを確認", async () => {
		await page
			.getByRole("main")
			.getByLabel("キーワード")
			.fill(testUser.lastName);
		await page.getByRole("button", { name: "検索" }).click();

		await expect(
			page.getByText("ユーザーが見つかりませんでした"),
		).toBeVisible();
	});
});

test("一般ユーザーにはユーザー削除ボタンが表示されない", async ({
	pageWithGenericUser: page,
	testUser,
}) => {
	await test.step("ユーザー詳細ページに遷移", async () => {
		await page.goto(`/users/${testUser.userId}`);
		await page.waitForURL(`/users/${testUser.userId}`);
	});

	await test.step("削除ボタンが表示されないことを確認", async () => {
		await expect(
			page.getByRole("heading", {
				name: `${testUser.lastName} ${testUser.firstName}`,
			}),
		).toBeVisible();
		await expect(page.getByRole("button", { name: "削除" })).toBeHidden();
	});
});

test("管理者でも自分自身の詳細ページでは削除ボタンが表示されない", async ({
	pageWithAdminUser: page,
	adminStaffId,
}) => {
	await test.step("自分自身の詳細ページに遷移", async () => {
		await page.goto(`/users/${adminStaffId}`);
		await page.waitForURL(`/users/${adminStaffId}`);
	});

	await test.step("削除ボタンが表示されないことを確認", async () => {
		await expect(page.getByText("佐藤 次郎")).toBeVisible();
		await expect(page.getByRole("button", { name: "削除" })).toBeHidden();
	});
});
