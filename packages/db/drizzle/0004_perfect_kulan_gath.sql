CREATE TABLE "customer_memories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"customer_id" uuid NOT NULL,
	"category" smallint NOT NULL,
	"content" text NOT NULL,
	"importance" smallint DEFAULT 5 NOT NULL,
	"source_note_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

ALTER TABLE "customer_memories" ADD CONSTRAINT "customer_memories_customer_id_customers_customer_id_fk" FOREIGN KEY ("customer_id") REFERENCES "customers"("customer_id") ON DELETE cascade ON UPDATE no action;
CREATE INDEX "idx_customer_memories_importance" ON "customer_memories" USING btree ("customer_id","importance" DESC NULLS LAST);
CREATE INDEX "idx_customer_memories_category" ON "customer_memories" USING btree ("customer_id","category");