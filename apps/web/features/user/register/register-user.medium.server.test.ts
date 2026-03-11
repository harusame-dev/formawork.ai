import { randomUUID } from "node:crypto";
import { createAdminClient } from "@repo/supabase/admin";
import { db } from "@workspace/db/client";
import { staffsTable } from "@workspace/db/schema/staff";
import { eq } from "drizzle-orm";
import { test as base, expect } from "vitest";
import { registerUser } from "./register-user";

const test = base.extend<{
	cleanup: { userIds: string[]; authUserIds: string[] };
}>({
	cleanup: async (
		// biome-ignore lint/correctness/noEmptyPattern: Vitestのfixtureパターンで使用する標準的な記法
		{},
		use,
	) => {
		const userIds: string[] = [];
		const authUserIds: string[] = [];
		await use({ authUserIds, userIds });

		const supabase = createAdminClient();
		for (const userId of userIds) {
			const [user] = await db
				.select({ authUserId: staffsTable.authUserId })
				.from(staffsTable)
				.where(eq(staffsTable.staffId, userId))
				.limit(1);

			await db.delete(staffsTable).where(eq(staffsTable.staffId, userId));

			if (user?.authUserId) {
				await supabase.auth.admin.deleteUser(user.authUserId);
			}
		}
		for (const authUserId of authUserIds) {
			await supabase.auth.admin.deleteUser(authUserId);
		}
	},
});

test("ユーザーを正常に登録できる", async ({ cleanup }) => {
	const uniqueId = randomUUID().slice(0, 8);
	const input = {
		email: `user-${uniqueId}@example.com`,
		firstName: `太郎${uniqueId}`,
		lastName: "テスト",
		password: "TestPassword123!",
		role: "user" as const,
	};

	const result = await registerUser(input);

	expect(result.success).toBe(true);
	if (result.success) {
		expect(result.data.userId).toBeDefined();
		cleanup.userIds.push(result.data.userId);
	}

	if (!result.success) return;

	const users = await db
		.select()
		.from(staffsTable)
		.where(eq(staffsTable.staffId, result.data.userId))
		.limit(1);

	expect(users).toHaveLength(1);
	expect(users[0]?.firstName).toBe(input.firstName);
	expect(users[0]?.lastName).toBe(input.lastName);

	const supabase = createAdminClient();
	const { data } = await supabase.auth.admin.listUsers();
	const authUser = data.users.find((u) => u.email === input.email);
	expect(authUser).toBeDefined();
	expect(authUser?.app_metadata?.["role"]).toBe(input.role);
	expect(authUser?.app_metadata?.["staffId"]).toBe(result.data.userId);
});

test("firstName と lastName が24文字（境界値）で登録できる", async ({
	cleanup,
}) => {
	const uniqueId = randomUUID().slice(0, 8);
	const input = {
		email: `user-name24-${uniqueId}@example.com`,
		firstName: "あ".repeat(24),
		lastName: "い".repeat(24),
		password: "TestPassword123!",
		role: "user" as const,
	};

	const result = await registerUser(input);

	expect(result.success).toBe(true);
	if (result.success) {
		cleanup.userIds.push(result.data.userId);
	}

	if (!result.success) return;

	const users = await db
		.select()
		.from(staffsTable)
		.where(eq(staffsTable.staffId, result.data.userId))
		.limit(1);

	expect(users).toHaveLength(1);
	expect(users[0]?.firstName).toBe(input.firstName);
	expect(users[0]?.lastName).toBe(input.lastName);
});

test("管理者ロールで登録できる", async ({ cleanup }) => {
	const uniqueId = randomUUID().slice(0, 8);
	const input = {
		email: `user-admin-${uniqueId}@example.com`,
		firstName: `太郎${uniqueId}`,
		lastName: "管理者",
		password: "TestPassword123!",
		role: "admin" as const,
	};

	const result = await registerUser(input);

	expect(result.success).toBe(true);
	if (result.success) {
		cleanup.userIds.push(result.data.userId);
	}

	const supabase = createAdminClient();
	const { data } = await supabase.auth.admin.listUsers();
	const authUser = data.users.find((u) => u.email === input.email);
	expect(authUser?.app_metadata?.["role"]).toBe("admin");
});

test("Supabase Auth に既に存在するメールアドレスで登録するとエラーになる", async ({
	cleanup,
}) => {
	const uniqueId = randomUUID().slice(0, 8);
	const email = `user-dup-${uniqueId}@example.com`;

	const supabase = createAdminClient();
	const { data: existingUser } = await supabase.auth.admin.createUser({
		email,
		email_confirm: true,
		password: "TestPassword123!",
	});
	if (existingUser.user) {
		cleanup.authUserIds.push(existingUser.user.id);
	}

	const input = {
		email,
		firstName: "太郎",
		lastName: "テスト",
		password: "TestPassword123!",
		role: "user" as const,
	};

	const result = await registerUser(input);

	expect(result.success).toBe(false);
	if (!result.success) {
		expect(result.error).toBe("このメールアドレスは既に登録されています");
	}
});
