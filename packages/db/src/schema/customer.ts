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
	address: text("address"),
	birthDate: date("birth_date"),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	customerId: uuid("customer_id").primaryKey(),
	email: text("email").notNull(),
	firstName: text("first_name").notNull(),
	firstNameKana: text("first_name_kana"),
	gender: smallint("gender").notNull().default(1),
	lastName: text("last_name").notNull(),
	lastNameKana: text("last_name_kana"),
	phone: text("phone").notNull(),
	remarks: text("remarks"),
	updatedAt: timestamp("updated_at")
		.defaultNow()
		.notNull()
		.$onUpdate(() => new Date()),
});

export type SelectCustomer = typeof customersTable.$inferSelect;
export type InsertCustomer = typeof customersTable.$inferInsert;
