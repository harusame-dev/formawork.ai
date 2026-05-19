ALTER TABLE "customers"
ADD COLUMN "address" text DEFAULT '' NOT NULL;

ALTER TABLE "customers"
ADD COLUMN "birth_date" date;

ALTER TABLE "customers"
ADD COLUMN "first_name_kana" text DEFAULT '' NOT NULL;

ALTER TABLE "customers"
ADD COLUMN "gender" smallint DEFAULT 1 NOT NULL;

ALTER TABLE "customers"
ADD COLUMN "last_name_kana" text DEFAULT '' NOT NULL;

ALTER TABLE "customers"
ADD COLUMN "remarks" text DEFAULT '' NOT NULL;

ALTER TABLE "customer_notes"
ADD COLUMN "service_date" date NOT NULL;
