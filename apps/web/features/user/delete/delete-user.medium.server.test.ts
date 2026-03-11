import { db } from "@workspace/db/client";
import { staffsTable } from "@workspace/db/schema/staff";
import { eq } from "drizzle-orm";
import { v4 } from "uuid";
import { test as base, expect, type Mock, vi } from "vitest";
import { deleteUser } from "./delete-user";

vi.mock("@repo/logger/nextjs/server", () => ({
	getLogger: vi.fn().mockResolvedValue({
		error: vi.fn(),
		info: vi.fn(),
		warn: vi.fn(),
	}),
}));

vi.mock("@repo/supabase/admin", () => ({
	createAdminClient: vi.fn(),
}));

const test = base.extend<{
	user: {
		firstName: string;
		lastName: string;
		userId: string;
	};
	userWithAuthUser: {
		authUserId: string;
		firstName: string;
		lastName: string;
		userId: string;
	};
	supabaseAdminMock: Mock;
}>({
	// biome-ignore lint/correctness/noEmptyPattern: Vitestのfixtureパターンで使用する標準的な記法
	// biome-ignore lint/suspicious/noExplicitAny: https://github.com/vitest-dev/vitest/discussions/5710
	async supabaseAdminMock({}, use: any) {
		const supabaseModule = await import("@repo/supabase/admin");
		const mock = vi.mocked(supabaseModule.createAdminClient);
		await use(mock);
		vi.clearAllMocks();
	},
	// biome-ignore lint/correctness/noEmptyPattern: Vitestのfixtureパターンで使用する標準的な記法
	async user({}, use) {
		const user = {
			firstName: "太郎",
			lastName: "テスト",
			userId: v4(),
		};

		await db.insert(staffsTable).values({
			firstName: user.firstName,
			lastName: user.lastName,
			staffId: user.userId,
		});
		await use(user);
		await db.delete(staffsTable).where(eq(staffsTable.staffId, user.userId));
	},
	// biome-ignore lint/correctness/noEmptyPattern: Vitestのfixtureパターンで使用する標準的な記法
	async userWithAuthUser({}, use) {
		const authUserId = v4();
		const user = {
			authUserId,
			firstName: "太郎",
			lastName: "テスト",
			userId: v4(),
		};

		await db.insert(staffsTable).values({
			authUserId,
			firstName: user.firstName,
			lastName: user.lastName,
			staffId: user.userId,
		});
		await use(user);
		await db.delete(staffsTable).where(eq(staffsTable.staffId, user.userId));
	},
});

test("存在しないユーザーを削除しようとした場合にエラーが返される", async () => {
	const nonExistentUserId = "99999999-9999-9999-9999-999999999999";
	const currentUserId = "00000000-0000-0000-0000-000000000001";

	const result = await deleteUser({
		currentUserId,
		userId: nonExistentUserId,
	});

	expect(result.success).toBe(false);
	if (!result.success) {
		expect(result.error).toBe("指定されたユーザーが見つかりません");
	}
});

test("自分自身を削除しようとした場合にエラーが返される", async ({ user }) => {
	const result = await deleteUser({
		currentUserId: user.userId,
		userId: user.userId,
	});

	expect(result.success).toBe(false);
	if (!result.success) {
		expect(result.error).toBe("自分自身は削除できません");
	}
});

test("存在するユーザーを削除できる", async ({
	userWithAuthUser,
	supabaseAdminMock,
}) => {
	const currentUserId = "00000000-0000-0000-0000-000000000001";

	supabaseAdminMock.mockReturnValue({
		auth: {
			admin: {
				deleteUser: vi.fn().mockResolvedValue({ error: null }),
			},
		},
	});

	const result = await deleteUser({
		currentUserId,
		userId: userWithAuthUser.userId,
	});

	expect(result.success).toBe(true);

	const [deletedUser] = await db
		.select()
		.from(staffsTable)
		.where(eq(staffsTable.staffId, userWithAuthUser.userId))
		.limit(1);

	expect(deletedUser).toBeUndefined();
});

test("authUserId が null のユーザーを削除できる", async ({ user }) => {
	const currentUserId = "00000000-0000-0000-0000-000000000001";

	const result = await deleteUser({
		currentUserId,
		userId: user.userId,
	});

	expect(result.success).toBe(true);

	const [deletedUser] = await db
		.select()
		.from(staffsTable)
		.where(eq(staffsTable.staffId, user.userId))
		.limit(1);

	expect(deletedUser).toBeUndefined();
});
