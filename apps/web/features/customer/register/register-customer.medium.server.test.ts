import { db } from "@workspace/db/client";
import { customersTable } from "@workspace/db/schema/customer";
import { eq } from "drizzle-orm";
import { expect, test } from "vitest";
import { registerCustomer } from "./register-customer";

const baseInput = {
	address: "",
	birthDate: "",
	email: "",
	firstName: "太郎",
	firstNameKana: "",
	gender: 1,
	lastName: "テスト",
	lastNameKana: "",
	phone: "",
	remarks: "",
};

test("lastName が24文字（境界値）で登録できる", async () => {
	const input = {
		...baseInput,
		email: `test-last-name-24-${Date.now()}@example.com`,
		lastName: "あ".repeat(24),
	};

	const result = await registerCustomer(input);

	expect(result.success).toBe(true);

	const customers = await db
		.select()
		.from(customersTable)
		.where(eq(customersTable.email, input.email))
		.limit(1);

	expect(customers).toHaveLength(1);
	expect(customers[0]?.lastName).toBe(input.lastName);

	await db.delete(customersTable).where(eq(customersTable.email, input.email));
});

test("email が254文字（境界値）で登録できる", async () => {
	const input = {
		...baseInput,
		email: `${"a".repeat(242)}@example.com`,
	};

	const result = await registerCustomer(input);

	expect(result.success).toBe(true);

	const customers = await db
		.select()
		.from(customersTable)
		.where(eq(customersTable.email, input.email))
		.limit(1);

	expect(customers).toHaveLength(1);
	expect(customers[0]?.email).toBe(input.email);

	await db.delete(customersTable).where(eq(customersTable.email, input.email));
});

test("phone が20文字（境界値）で登録できる", async () => {
	const input = {
		...baseInput,
		email: `test-phone-20-${Date.now()}@example.com`,
		phone: "0".repeat(20),
	};

	const result = await registerCustomer(input);

	expect(result.success).toBe(true);

	const customers = await db
		.select()
		.from(customersTable)
		.where(eq(customersTable.email, input.email))
		.limit(1);

	expect(customers).toHaveLength(1);
	expect(customers[0]?.phone).toBe(input.phone);

	await db.delete(customersTable).where(eq(customersTable.email, input.email));
});
