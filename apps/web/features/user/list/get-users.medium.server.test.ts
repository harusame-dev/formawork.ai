import { v4 } from "uuid";
import { test as base, expect, vi } from "vitest";
import { deleteUser } from "../delete/delete-user";
import { registerUser } from "../register/register-user";
import { getUsers } from "./get-users";

vi.mock("next/cache", () => ({
	cacheLife: vi.fn(),
	cacheTag: vi.fn(),
}));

vi.mock("@repo/logger/nextjs/server", () => ({
	getLogger: vi.fn(() => ({
		error: vi.fn(),
		info: vi.fn(),
		warn: vi.fn(),
	})),
}));

const test = base.extend<{
	user: {
		id: string;
		firstName: string;
		lastName: string;
		email: string;
	};
}>({
	// biome-ignore lint/correctness/noEmptyPattern: Vitestのfixtureパターンで使用する標準的な記法
	async user({}, use) {
		const email = `test-user-${v4()}@example.com`;
		const firstName = v4();
		const lastName = v4();

		const result = await registerUser({
			email,
			firstName,
			lastName,
			password: "TestPassword123!",
			role: "user",
		});

		if (!result.success) {
			throw new Error("Failed to create user");
		}

		await use({
			email,
			firstName,
			id: result.data.userId,
			lastName,
		});

		await deleteUser({
			currentUserId: "dummy-user-id",
			userId: result.data.userId,
		});
	},
});

test("firstName で完全一致検索できる", async ({ user }) => {
	const nameSearchResult = await getUsers({
		keyword: user.firstName,
		page: 1,
	});

	expect(nameSearchResult.users.length).toBe(1);
	expect(nameSearchResult.users[0]?.firstName).toBe(user.firstName);
});

test("lastName で完全一致検索できる", async ({ user }) => {
	const nameSearchResult = await getUsers({
		keyword: user.lastName,
		page: 1,
	});

	expect(nameSearchResult.users.length).toBe(1);
	expect(nameSearchResult.users[0]?.lastName).toBe(user.lastName);
});

test("lastName の部分一致では検索できない", async ({ user }) => {
	const partialLastName = user.lastName.slice(0, 8);

	const nameSearchResult = await getUsers({
		keyword: partialLastName,
		page: 1,
	});

	expect(nameSearchResult.users.length).toBe(0);
});

test("firstName の部分一致では検索できない", async ({ user }) => {
	const partialFirstName = user.firstName.slice(0, 8);

	const nameSearchResult = await getUsers({
		keyword: partialFirstName,
		page: 1,
	});

	expect(nameSearchResult.users.length).toBe(0);
});
