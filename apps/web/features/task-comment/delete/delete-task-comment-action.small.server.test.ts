import { test as base, expect, type Mock, vi } from "vitest";
import { deleteTaskCommentAction } from "./delete-task-comment.action";

vi.mock("@repo/logger/nextjs/server", () => ({
	getLogger: vi.fn().mockResolvedValue({
		info: vi.fn(),
		warn: vi.fn(),
	}),
}));

vi.mock("@/features/auth/get-user-staff-id", () => ({
	getUserStaffId: vi.fn(),
}));

vi.mock("@/features/auth/get-user-role", async (importOriginal) => {
	const actual =
		await importOriginal<typeof import("@/features/auth/get-user-role")>();
	return {
		...actual,
		getUserRole: vi.fn(),
	};
});

const test = base.extend<{
	getUserRoleMock: Mock;
	getUserStaffIdMock: Mock;
}>({
	// biome-ignore lint/correctness/noEmptyPattern: Vitestのfixtureパターンで使用する標準的な記法
	// biome-ignore lint/suspicious/noExplicitAny: https://github.com/vitest-dev/vitest/discussions/5710
	getUserRoleMock: async ({}, use: any) => {
		const mod = await import("@/features/auth/get-user-role");
		const mock = vi.mocked(mod.getUserRole);
		await use(mock);
		vi.clearAllMocks();
	},
	// biome-ignore lint/correctness/noEmptyPattern: Vitestのfixtureパターンで使用する標準的な記法
	// biome-ignore lint/suspicious/noExplicitAny: https://github.com/vitest-dev/vitest/discussions/5710
	getUserStaffIdMock: async ({}, use: any) => {
		const mod = await import("@/features/auth/get-user-staff-id");
		const mock = vi.mocked(mod.getUserStaffId);
		await use(mock);
		vi.clearAllMocks();
	},
});

test("未認証ユーザーがアクセスするとエラーになる", async ({
	getUserStaffIdMock,
}) => {
	getUserStaffIdMock.mockResolvedValue(null);

	const result = await deleteTaskCommentAction({
		commentId: "00000000-0000-0000-0000-000000000001",
		taskId: "00000000-0000-0000-0000-000000000002",
	});

	expect(result.success).toBe(false);
	if (!result.success) {
		expect(result.error).toBe("認証に失敗しました");
	}
});

test("不正なUUID形式でバリデーションエラーになる", async ({
	getUserRoleMock,
	getUserStaffIdMock,
}) => {
	getUserStaffIdMock.mockResolvedValue("staff-id");
	getUserRoleMock.mockResolvedValue("user");

	const result = await deleteTaskCommentAction({
		commentId: "invalid-uuid",
		taskId: "00000000-0000-0000-0000-000000000002",
	});

	expect(result.success).toBe(false);
	if (!result.success) {
		expect(result.error).toBe("入力内容に誤りがあります");
	}
});
