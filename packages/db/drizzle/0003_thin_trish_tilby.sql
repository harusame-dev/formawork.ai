ALTER TABLE "customers" ADD COLUMN "address" text;
ALTER TABLE "customers" ADD COLUMN "birth_date" date;
ALTER TABLE "customers" ADD COLUMN "first_name_kana" text;
ALTER TABLE "customers" ADD COLUMN "gender" smallint DEFAULT 1 NOT NULL;
ALTER TABLE "customers" ADD COLUMN "last_name_kana" text;
ALTER TABLE "customers" ADD COLUMN "remarks" text;