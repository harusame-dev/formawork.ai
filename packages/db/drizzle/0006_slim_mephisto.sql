ALTER TABLE "customers"
ADD COLUMN "full_name" text GENERATED ALWAYS AS (
  "customers"."last_name" || "customers"."first_name"
) STORED;

ALTER TABLE "customers"
ADD COLUMN "full_name_kana" text GENERATED ALWAYS AS (
  "customers"."last_name_kana" || "customers"."first_name_kana"
) STORED;

CREATE INDEX "idx_customers_last_name_search" ON "customers" USING btree ("last_name" text_pattern_ops);

CREATE INDEX "idx_customers_first_name_search" ON "customers" USING btree ("first_name" text_pattern_ops);

CREATE INDEX "idx_customers_last_name_kana_search" ON "customers" USING btree ("last_name_kana" text_pattern_ops);

CREATE INDEX "idx_customers_first_name_kana_search" ON "customers" USING btree ("first_name_kana" text_pattern_ops);

CREATE INDEX "idx_customers_full_name_search" ON "customers" USING btree ("full_name" text_pattern_ops);

CREATE INDEX "idx_customers_full_name_kana_search" ON "customers" USING btree ("full_name_kana" text_pattern_ops);

CREATE INDEX "idx_customers_phone_search" ON "customers" USING btree ("phone" text_pattern_ops);

CREATE INDEX "idx_customers_email_search" ON "customers" USING btree ("email" text_pattern_ops);

CREATE INDEX "idx_customers_sort" ON "customers" USING btree ("full_name", "customer_id");
