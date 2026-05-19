import { sql } from "drizzle-orm";
import {
  date,
  index,
  pgSchema,
  smallint,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { schemaName } from "../pgschema";

// 1000 〜 10000 件想定
export const customersTable = pgSchema(schemaName)
  .table(
    "customers",
    {
      address: text("address").notNull().default(""),
      birthDate: date("birth_date"),
      createdAt: timestamp("created_at").defaultNow().notNull(),
      customerId: uuid("customer_id").primaryKey(),
      email: text("email").notNull(),
      firstName: text("first_name").notNull(),
      firstNameKana: text("first_name_kana").notNull().default(""),
      // Generated Columns（検索用）
      fullName: text("full_name").generatedAlwaysAs(
        (): ReturnType<typeof sql> =>
          sql`${customersTable.lastName} || ${customersTable.firstName}`,
      ),
      fullNameKana: text("full_name_kana").generatedAlwaysAs(
        (): ReturnType<typeof sql> =>
          sql`${customersTable.lastNameKana} || ${customersTable.firstNameKana}`,
      ),
      gender: smallint("gender").notNull().default(1),
      lastName: text("last_name").notNull(),
      lastNameKana: text("last_name_kana").notNull().default(""),
      phone: text("phone").notNull(),
      remarks: text("remarks").notNull().default(""),
      updatedAt: timestamp("updated_at")
        .defaultNow()
        .notNull()
        .$onUpdate(() => new Date()),
    },
    (table) => [
      index("idx_customers_last_name_search").using(
        "btree",
        table.lastName.op("text_pattern_ops"),
      ),
      index("idx_customers_first_name_search").using(
        "btree",
        table.firstName.op("text_pattern_ops"),
      ),
      index("idx_customers_last_name_kana_search").using(
        "btree",
        table.lastNameKana.op("text_pattern_ops"),
      ),
      index("idx_customers_first_name_kana_search").using(
        "btree",
        table.firstNameKana.op("text_pattern_ops"),
      ),
      index("idx_customers_full_name_search").using(
        "btree",
        table.fullName.op("text_pattern_ops"),
      ),
      index("idx_customers_full_name_kana_search").using(
        "btree",
        table.fullNameKana.op("text_pattern_ops"),
      ),
      index("idx_customers_phone_search").using(
        "btree",
        table.phone.op("text_pattern_ops"),
      ),
      index("idx_customers_email_search").using(
        "btree",
        table.email.op("text_pattern_ops"),
      ),
      // 検索条件なしの場合用
      index("idx_customers_sort").on(table.fullName, table.customerId),
    ],
  )
  .enableRLS();

export type SelectCustomer = typeof customersTable.$inferSelect;
export type InsertCustomer = typeof customersTable.$inferInsert;
