import { expect, test, vi } from "vitest";
import { registerProjectAction } from "./register-project.action";

vi.mock("next/cache", async () => ({
	updateTag: vi.fn(),
}));

vi.mock("next/navigation", async (importOriginal) => {
	const actual = await importOriginal<typeof import("next/navigation")>();
	return {
		...actual,
		redirect: vi.fn(),
	};
});

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

vi.mock("./register-project", () => ({
	registerProject: vi.fn(),
}));

test("案件名が空の場合にバリデーションエラーを返す", async () => {
	const { registerProject } = await import("./register-project");

	const result = await registerProjectAction({
		assigneeId: "00000000-0000-0000-0000-000000000001",
		name: "",
	});

	expect(result.success).toBe(false);
	if (!result.success) {
		expect(result.error).toBe("入力内容に誤りがあります");
	}
	expect(registerProject).not.toHaveBeenCalled();
});

test("不正なassigneeIdの場合にバリデーションエラーを返す", async () => {
	const { registerProject } = await import("./register-project");

	const result = await registerProjectAction({
		assigneeId: "invalid-uuid",
		name: "テスト案件",
	});

	expect(result.success).toBe(false);
	if (!result.success) {
		expect(result.error).toBe("入力内容に誤りがあります");
	}
	expect(registerProject).not.toHaveBeenCalled();
});
