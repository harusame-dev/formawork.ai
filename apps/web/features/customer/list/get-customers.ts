import { db } from "@workspace/db/client";
import type { SelectCustomer } from "@workspace/db/schema/customer";
import { customersTable } from "@workspace/db/schema/customer";
import { asc, like, or } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { CustomerTag } from "@/features/customer/tag";
import type { CustomersCondition } from "./schema";

interface GetCustomersResult {
  customers: SelectCustomer[];
  page: number;
  totalPages: number;
}

export async function getCustomers({
  keyword,
  page,
}: CustomersCondition): Promise<GetCustomersResult> {
  "use cache";

  cacheLife("permanent");
  cacheTag(CustomerTag.List);

  const pageSize = 20;
  const whereConditions = keyword
    ? or(
        // 姓・名（個別）
        like(customersTable.lastName, `${keyword}%`),
        like(customersTable.firstName, `${keyword}%`),
        // セイ・メイ（個別）
        like(customersTable.lastNameKana, `${keyword}%`),
        like(customersTable.firstNameKana, `${keyword}%`),
        // 姓名・セイメイ（結合）
        like(customersTable.fullName, `${keyword}%`),
        like(customersTable.fullNameKana, `${keyword}%`),
        // 電話・メール
        like(customersTable.phone, `${keyword}%`),
        like(customersTable.email, `${keyword}%`),
      )
    : undefined;

  const customers = await db
    .select()
    .from(customersTable)
    .where(whereConditions)
    .orderBy(asc(customersTable.fullName), asc(customersTable.customerId))
    .limit(pageSize)
    .offset((page - 1) * pageSize);

  const total = await db.$count(customersTable, whereConditions);

  return {
    customers,
    page,
    totalPages: Math.ceil(total / pageSize),
  };
}
