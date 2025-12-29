/**
 * スタッフ編集E2Eテスト
 *
 * このテストではスタッフデータを変更するため、testWithAuthenticated は使用せず
 * 独自のフィクスチャでテスト用スタッフを作成・削除しています。
 */
import { randomUUID } from "node:crypto";
import { test as base, expect, type Page } from "@playwright/test";
import { deleteStaff } from "@/features/staff/delete/delete-staff";
import { registerStaff } from "@/features/staff/register/register-staff";
import { adminUserAuthFile, genericUserAuthFile } from "./setups/auth-file";

const ADMIN_STAFF_ID = "00000000-0000-0000-0000-000000000003";

type StaffFixture = {
	email: string;
	firstName: string;
	lastName: string;
	role: "admin" | "user";
	staffId: string;
};

const test = base.extend<{
	adminRoleStaff: StaffFixture;
	adminStaffId: string;
	editStaffPage: Page;
	genericRoleStaff: StaffFixture;
	pageWithAdminStaff: Page;
	pageWithGenericStaff: Page;
}>({
	// biome-ignore lint/correctness/noEmptyPattern: Playwrightのfixtureパターンで使用する標準的な記法
	async adminRoleStaff({}, use) {
		const uniqueId = randomUUID().slice(0, 8);
		const staffData = {
			email: `admin-edit-test-${uniqueId}@example.com`,
			firstName: `管理者${uniqueId}`,
			lastName: `テスト${uniqueId}`,
			password: "AdminTest@123",
			role: "admin" as const,
		};

		const result = await registerStaff(staffData);
		if (!result.success) {
			throw new Error(`管理者テストスタッフの登録に失敗: ${result.error}`);
		}

		await use({
			email: staffData.email,
			firstName: staffData.firstName,
			lastName: staffData.lastName,
			role: staffData.role,
			staffId: result.data.staffId,
		});

		await deleteStaff({
			currentUserStaffId: ADMIN_STAFF_ID,
			staffId: result.data.staffId,
		});
	},
	// biome-ignore lint/correctness/noEmptyPattern: Playwrightのfixtureパターンで使用する標準的な記法
	async adminStaffId({}, use) {
		// シードデータで定義されている管理者スタッフID（佐藤次郎）
		await use(ADMIN_STAFF_ID);
	},
	editStaffPage: async (
		{ pageWithAdminStaff: page, genericRoleStaff },
		use,
	) => {
		await page.goto(`/staffs/${genericRoleStaff.staffId}/edit`);
		await page.waitForURL(`/staffs/${genericRoleStaff.staffId}/edit`);
		await expect(page.getByLabel("姓")).not.toBeDisabled();

		await use(page);
	},
	// biome-ignore lint/correctness/noEmptyPattern: Playwrightのfixtureパターンで使用する標準的な記法
	async genericRoleStaff({}, use) {
		const uniqueId = randomUUID().slice(0, 8);
		const staffData = {
			email: `edit-test-${uniqueId}@example.com`,
			firstName: `編集用${uniqueId}`,
			lastName: `テスト${uniqueId}`,
			password: "EditTest@123",
			role: "user" as const,
		};

		const result = await registerStaff(staffData);
		if (!result.success) {
			throw new Error(`テストスタッフの登録に失敗: ${result.error}`);
		}

		await use({
			email: staffData.email,
			firstName: staffData.firstName,
			lastName: staffData.lastName,
			role: staffData.role,
			staffId: result.data.staffId,
		});

		await deleteStaff({
			currentUserStaffId: ADMIN_STAFF_ID,
			staffId: result.data.staffId,
		});
	},
	async pageWithAdminStaff({ browser }, use) {
		const context = await browser.newContext({
			storageState: adminUserAuthFile,
		});
		const page = await context.newPage();

		await page.goto("/");
		await expect(page).toHaveURL("/");
		await use(page);
	},
	async pageWithGenericStaff({ browser }, use) {
		const context = await browser.newContext({
			storageState: genericUserAuthFile,
		});
		const page = await context.newPage();

		await page.goto("/");
		await expect(page).toHaveURL("/");
		await use(page);
	},
});

test("自分自身の編集画面ではロール変更ができない", async ({
	pageWithAdminStaff: page,
	adminStaffId,
}) => {
	await test.step("自分自身の編集ページに遷移", async () => {
		await page.goto(`/staffs/${adminStaffId}/edit`);
		await page.waitForURL(`/staffs/${adminStaffId}/edit`);
		await expect(page.getByLabel("姓")).not.toBeDisabled();
	});

	await test.step("ロール変更ができないことを確認", async () => {
		await expect(
			page.getByText("自分自身のロールは変更できません"),
		).toBeVisible();
		await expect(page.getByRole("radio", { name: "一般" })).toBeDisabled();
		await expect(page.getByRole("radio", { name: "管理者" })).toBeDisabled();
	});
});

test("他のスタッフの全入力内容を変更して反映される", async ({
	editStaffPage: page,
	genericRoleStaff,
}) => {
	const uniqueId = randomUUID().slice(0, 8);
	const updatedData = {
		email: `updated-${uniqueId}@example.com`,
		firstName: `更新後名${uniqueId}`.slice(0, 24),
		lastName: `更新後姓${uniqueId}`.slice(0, 24),
		role: "admin" as const,
	};

	await test.step("現在の値が表示されていることを確認", async () => {
		await expect(page.getByLabel("姓")).toHaveValue(genericRoleStaff.lastName);
		await expect(page.getByLabel("名")).toHaveValue(genericRoleStaff.firstName);
		await expect(page.getByLabel("メールアドレス")).toHaveValue(
			genericRoleStaff.email,
		);
		await expect(page.getByRole("radio", { name: "一般" })).toBeChecked();
	});

	await test.step("全フィールドを変更", async () => {
		await page.getByLabel("姓").fill(updatedData.lastName);
		await page.getByLabel("名").fill(updatedData.firstName);
		await page.getByLabel("メールアドレス").fill(updatedData.email);
		await page.getByRole("radio", { name: "管理者" }).click();
	});

	await test.step("編集ボタンをクリック", async () => {
		await page.getByRole("button", { name: "編集する" }).click();
	});

	await test.step("詳細ページに遷移することを確認", async () => {
		await page.waitForURL(`/staffs/${genericRoleStaff.staffId}`);
	});

	await test.step("変更内容が反映されていることを確認", async () => {
		await expect(
			page.getByRole("heading", {
				name: `${updatedData.lastName} ${updatedData.firstName}`,
			}),
		).toBeVisible();
		await expect(page.getByText(updatedData.email)).toBeVisible();
		await expect(page.getByText("管理者")).toBeVisible();
	});
});
