import { type Success, succeed } from "@harusame0616/result";
import { db } from "@workspace/db/client";
import { customersTable } from "@workspace/db/schema/customer";
import { generateUniqueId } from "@/libs/generate-unique-id";
import type { RegisterCustomerParams as RegisterCustomerParameters } from "./schema";

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
}: RegisterCustomerParameters): Promise<Success<{ customerId: string }>> {
  const customerId = generateUniqueId();

  await db.insert(customersTable).values({
    address,
    birthDate: birthDate || null,
    customerId,
    email,
    firstName,
    firstNameKana,
    gender,
    lastName,
    lastNameKana,
    phone,
    remarks,
  });

  return succeed({ customerId });
}
