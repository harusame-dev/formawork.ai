import { test as base, expect, type Mock, vi } from "vitest";
import { updateTaskStatusAction } from "./update-task-status.action";

vi.mock("next/cache", async () => ({
	updateTag: vi.fn(),
}));

vi.mock("@repo/logger/nextjs/server", () => ({
	getLogger: vi.fn().mockResolvedValue({
		error: vi.fn(),
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
	getUserStaffIdMock: Mock;
	getUserRoleMock: Mock;
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

test("認証されていない場合、認証エラーが返される", async ({
	getUserStaffIdMock,
}) => {
	getUserStaffIdMock.mockResolvedValue(null);

	const result = await updateTaskStatusAction({
		projectId: "00000000-0000-0000-0000-000000000001",
		status: "done",
		taskId: "00000000-0000-0000-0000-000000000002",
	});

	expect(result.success).toBe(false);
	if (!result.success) {
		expect(result.error).toBe("認証に失敗しました");
	}
});

test("不正なstatusの場合、バリデーションエラーが返される", async ({
	getUserStaffIdMock,
	getUserRoleMock,
}) => {
	getUserStaffIdMock.mockResolvedValue("staff-id");
	getUserRoleMock.mockResolvedValue("user");

	const result = await updateTaskStatusAction({
		projectId: "00000000-0000-0000-0000-000000000001",
		// biome-ignore lint/suspicious/noExplicitAny: テスト目的で不正な値を渡す
		status: "invalid_status" as any,
		taskId: "00000000-0000-0000-0000-000000000002",
	});

	expect(result.success).toBe(false);
	if (!result.success) {
		expect(result.error).toBe("入力内容に誤りがあります");
	}
});
