import { sql } from "drizzle-orm";
import {
	date,
	pgSchema,
	smallint,
	text,
	timestamp,
	uuid,
} from "drizzle-orm/pg-core";
import { schemaName } from "../pgschema";

export const customersTable = pgSchema(schemaName).table("customers", {
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
});

export type SelectCustomer = typeof customersTable.$inferSelect;
export type InsertCustomer = typeof customersTable.$inferInsert;
