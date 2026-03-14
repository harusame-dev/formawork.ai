import { expect, test, vi } from "vitest";
import { registerTaskAction } from "./register-task.action";

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
	getUserStaffId: vi.fn().mockResolvedValue("test-staff-id"),
}));

vi.mock("@/features/auth/get-user-role", async (importOriginal) => {
	const actual =
		await importOriginal<typeof import("@/features/auth/get-user-role")>();
	return {
		...actual,
		getUserRole: vi.fn().mockResolvedValue("user"),
	};
});

vi.mock("./register-task", () => ({
	registerTask: vi.fn(),
}));

test("タスク名が空の場合にバリデーションエラーを返す", async () => {
	const { registerTask } = await import("./register-task");

	const result = await registerTaskAction({
		assigneeIds: [],
		name: "",
		projectId: "00000000-0000-0000-0000-000000000001",
		status: "todo",
	});

	expect(result.success).toBe(false);
	if (!result.success) {
		expect(result.error).toBe("入力内容に誤りがあります");
	}
	expect(registerTask).not.toHaveBeenCalled();
});
