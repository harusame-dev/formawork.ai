-- 既存データには created_at の日付を設定
ALTER TABLE "customer_notes" ADD COLUMN "service_date" date;
UPDATE "customer_notes" SET "service_date" = DATE("created_at") WHERE "service_date" IS NULL;
ALTER TABLE "customer_notes" ALTER COLUMN "service_date" SET NOT NULL;