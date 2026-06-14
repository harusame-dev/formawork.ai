import { db } from "@workspace/db/client";
import { customersTable } from "@workspace/db/schema/customer";
import { eq } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import { test as base, expect, vi } from "vitest";
import { getCustomers } from "./get-customers";

// Next.jsのキャッシュAPIをモック
vi.mock("next/cache", () => ({
  cacheLife: vi.fn(),
  cacheTag: vi.fn(),
}));

const test = base.extend<{
  customer: {
    customerId: string;
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
  };
}>({
  async customer({}, use) {
    const customer = {
      customerId: randomUUID(),
      email: `${randomUUID()}@example.com`,
      firstName: randomUUID().slice(0, 12),
      lastName: randomUUID().slice(0, 12),
      phone: `${Math.floor(Math.random() * 1_000_000_000)}`,
    };

    await db.insert(customersTable).values(customer);
    await use(customer);
    await db
      .delete(customersTable)
      .where(eq(customersTable.customerId, customer.customerId));
  },
});

test("姓名で検索ができる", async ({ customer }) => {
  const firstNameSearchResult = await getCustomers({
    keyword: customer.firstName,
    page: 1,
  });
  const lastNameSearchResult = await getCustomers({
    keyword: customer.lastName,
    page: 1,
  });

  expect(firstNameSearchResult.customers.length).toBe(1);
  expect(lastNameSearchResult.customers.length).toBe(1);
});
