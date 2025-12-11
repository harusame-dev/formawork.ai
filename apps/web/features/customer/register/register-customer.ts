import { type Success, succeed } from "@harusame0616/result";
import { db } from "@workspace/db/client";
import { customersTable } from "@workspace/db/schema/customer";
import { generateUniqueId } from "@/libs/generate-unique-id";
import type { RegisterCustomerParams } from "./schema";

export async function registerCustomer({
	address,
	birthDate,
	email,
	firstName,
	firstNameKana,
	gender,
	lastName,
	lastNameKana,
	phone,
	remarks,
}: RegisterCustomerParams): Promise<Success<{ customerId: string }>> {
	const customerId = generateUniqueId();

	await db.insert(customersTable).values({
		address: address || null,
		birthDate: birthDate || null,
		customerId,
		email,
		firstName,
		firstNameKana: firstNameKana || null,
		gender,
		lastName,
		lastNameKana: lastNameKana || null,
		phone,
		remarks: remarks || null,
	});

	return succeed({ customerId });
}
