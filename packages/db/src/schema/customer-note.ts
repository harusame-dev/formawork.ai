import {
  date,
  index,
  integer,
  pgSchema,
  primaryKey,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { schemaName } from "../pgschema";
import { customersTable } from "./customer";
import { staffsTable } from "./staff";

// 顧客につき１日１つ登録を想定して、医療の記録保持義務期間が５年なので５年を想定
// 顧客数 x 365日 x 5年 = 10,000 * 365 * 5 = 最大 18,250,000 レコード
// ただし、現在は顧客基点の表示のみのため、確実に 365 * 5 で 1,825 レコードに絞られる
// そのため、 customerId にのみ index をはり、本文などはインデックスなしの like 検索を許容
export const customerNotesTable = pgSchema(schemaName)
  .table(
    "customer_notes",
    {
      content: text("content").notNull(),
      createdAt: timestamp("created_at").defaultNow().notNull(),
      customerId: uuid("customer_id")
        .notNull()
        .references(() => customersTable.customerId, { onDelete: "cascade" }),
      customerNoteId: uuid("customer_note_id").primaryKey().defaultRandom(),
      serviceDate: date("service_date").notNull(),
      staffId: uuid("staff_id")
        .notNull()
        .references(() => staffsTable.staffId, { onDelete: "cascade" }),
      updatedAt: timestamp("updated_at")
        .defaultNow()
        .notNull()
        .$onUpdate(() => new Date()),
    },
    (table) => [
      index("idx_customer_notes_customer_service_date").on(
        table.customerId,
        table.serviceDate.desc(),
      ),
    ],
  )
  .enableRLS();

export const customerNoteImagesTable = pgSchema(schemaName)
  .table(
    "customer_note_images",
    {
      createdAt: timestamp("created_at").defaultNow().notNull(),
      customerNoteId: uuid("customer_note_id")
        .notNull()
        .references(() => customerNotesTable.customerNoteId, {
          onDelete: "cascade",
        }),
      displayOrder: integer("display_order").notNull(),
      path: text("path").notNull(),
    },
    (table) => [
      primaryKey({ columns: [table.customerNoteId, table.displayOrder] }),
    ],
  )
  .enableRLS();

export type SelectCustomerNote = typeof customerNotesTable.$inferSelect;
export type InsertCustomerNote = typeof customerNotesTable.$inferInsert;
export type SelectCustomerNoteImage =
  typeof customerNoteImagesTable.$inferSelect;
export type InsertCustomerNoteImage =
  typeof customerNoteImagesTable.$inferInsert;
