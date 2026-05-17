ALTER TABLE "chats" ALTER COLUMN "referrer_org_id" DROP NOT NULL;
ALTER TABLE "consultations" ALTER COLUMN "target_org_id" DROP NOT NULL;
ALTER TABLE "users" ALTER COLUMN "organization_id" DROP NOT NULL;
