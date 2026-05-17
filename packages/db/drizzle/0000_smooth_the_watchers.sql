CREATE TABLE "chats" (
	"chat_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"contact_email" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"last_accessed_at" timestamp DEFAULT now() NOT NULL,
	"referrer_org_id" uuid NOT NULL
);

ALTER TABLE "chats" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "chat_messages" (
	"chat_id" uuid NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"message_id" bigserial PRIMARY KEY NOT NULL,
	"role" text NOT NULL
);

ALTER TABLE "chat_messages" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "chat_todos" (
	"chat_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"done" boolean DEFAULT false NOT NULL,
	"priority" smallint NOT NULL,
	"suggested_category_id" uuid,
	"title" text NOT NULL,
	"todo_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

ALTER TABLE "chat_todos" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "consultations" (
	"chat_id" uuid NOT NULL,
	"consultation_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"contact_email" text NOT NULL,
	"sent_at" timestamp DEFAULT now() NOT NULL,
	"target_org_id" uuid NOT NULL,
	"todo_id" uuid
);

ALTER TABLE "consultations" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "organizations" (
	"category_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"email" text DEFAULT '' NOT NULL,
	"name" text NOT NULL,
	"organization_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

ALTER TABLE "organizations" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "organization_categories" (
	"category_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"is_system" boolean DEFAULT false NOT NULL,
	"name" text NOT NULL,
	"sort_order" smallint NOT NULL
);

ALTER TABLE "organization_categories" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "users" (
	"auth_user_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"organization_id" uuid NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"user_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	CONSTRAINT "users_auth_user_id_unique" UNIQUE("auth_user_id")
);

ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;