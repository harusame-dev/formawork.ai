import { randomUUID } from "node:crypto";
import { expect } from "@playwright/test";
import { db } from "@workspace/db/client";
import { staffsTable } from "@workspace/db/schema/staff";
import { eq } from "drizzle-orm";
import { registerStaff } from "@/features/staff/register/register-staff";
import { testWithAuthenticated } from "./fixtures/authenticated-test";

const test = testWithAuthenticated.extend<{
	testStaff: {
		email: string;
		firstName: string;
		lastName: string;
		staffId: string;
	};
}>({
	// biome-ignore lint/correctness/noEmptyPattern: Playwrightのfixtureパターンで使用する標準的な記法
	async testStaff({}, use) {
		const uniqueId = randomUUID().slice(0, 8);
		const staffData = {
			email: `test-staff-${randomUUID()}@example.com`,
			firstName: `削除用${uniqueId}`,
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

		// クリーンアップ: 削除テストで削除されなかった場合に備えて
		await db.delete(staffsTable).where(eq(staffsTable.staffId, staffId));
	},
});

test("管理者がスタッフを削除できる", async ({
	pageWithAdminUser: page,
	testStaff,
}) => {
	await test.step("スタッフ詳細ページに遷移", async () => {
		await page.goto(`/staffs/${testStaff.staffId}`);
		await page.waitForURL(`/staffs/${testStaff.staffId}`);
		await expect(
			page.getByRole("heading", {
				name: `${testStaff.lastName} ${testStaff.firstName}`,
			}),
		).toBeVisible();
	});

	await test.step("削除実行", async () => {
		await page.getByRole("button", { name: "削除" }).click();
		await page
			.getByRole("dialog")
			.getByRole("button", { name: "削除" })
			.click();
		await page.waitForURL("/staffs");
	});

	await test.step("削除されたスタッフを検索してもヒットしないことを確認", async () => {
		await page
			.getByRole("main")
			.getByLabel("キーワード")
			.fill(testStaff.lastName);
		await page.getByRole("button", { name: "検索" }).click();

		await expect(
			page.getByText("スタッフが見つかりませんでした"),
		).toBeVisible();
	});
});

test("一般ユーザーにはスタッフ削除ボタンが表示されない", async ({
	pageWithGenericUser: page,
	testStaff,
}) => {
	await test.step("スタッフ詳細ページに遷移", async () => {
		await page.goto(`/staffs/${testStaff.staffId}`);
		await page.waitForURL(`/staffs/${testStaff.staffId}`);
	});

	await test.step("削除ボタンが表示されないことを確認", async () => {
		await expect(
			page.getByRole("heading", {
				name: `${testStaff.lastName} ${testStaff.firstName}`,
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
		await page.goto(`/staffs/${adminStaffId}`);
		await page.waitForURL(`/staffs/${adminStaffId}`);
	});

	await test.step("削除ボタンが表示されないことを確認", async () => {
		await expect(page.getByText("佐藤 次郎")).toBeVisible();
		await expect(page.getByRole("button", { name: "削除" })).toBeHidden();
	});
});
