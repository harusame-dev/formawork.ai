-- CREATE EXTENSION を実行した際に search_path がクリアされてしまうので
-- 事前に保存して復元する
DO $$
BEGIN
  PERFORM set_config('app.saved_search_path', current_setting('search_path'), false);
END $$;

-- pgvector 拡張の有効化（Supabase 標準の extensions スキーマに導入）
CREATE EXTENSION IF NOT EXISTS vector
WITH
  SCHEMA extensions;

DO $$
BEGIN
  PERFORM set_config('search_path', current_setting('app.saved_search_path'), false);
END $$;

CREATE TABLE "glossaries" (
  "created_at" timestamp DEFAULT now() NOT NULL,
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "note" text DEFAULT '' NOT NULL,
  "project_id" uuid,
  "source_term" text NOT NULL,
  "target_term" text NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

ALTER TABLE "glossaries" ENABLE ROW LEVEL SECURITY;

CREATE TABLE "project_members" (
  "created_at" timestamp DEFAULT now() NOT NULL,
  "project_id" uuid NOT NULL,
  "role" smallint DEFAULT 2 NOT NULL,
  "user_id" uuid NOT NULL,
  CONSTRAINT "project_members_project_id_user_id_pk" PRIMARY KEY ("project_id", "user_id")
);

ALTER TABLE "project_members" ENABLE ROW LEVEL SECURITY;

CREATE TABLE "projects" (
  "created_at" timestamp DEFAULT now() NOT NULL,
  "description" text DEFAULT '' NOT NULL,
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "name" text NOT NULL,
  "owner_user_id" uuid NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  "visibility" smallint DEFAULT 2 NOT NULL
);

ALTER TABLE "projects" ENABLE ROW LEVEL SECURITY;

CREATE TABLE "segments" (
  "created_at" timestamp DEFAULT now() NOT NULL,
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "seq" integer NOT NULL,
  "source_text" text NOT NULL,
  "status" smallint DEFAULT 1 NOT NULL,
  "target_text" text,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  "work_id" uuid NOT NULL
);

ALTER TABLE "segments" ENABLE ROW LEVEL SECURITY;

CREATE TABLE "staffs" (
  "auth_user_id" uuid,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "first_name" text NOT NULL,
  "last_name" text NOT NULL,
  "staff_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "staffs_auth_user_id_unique" UNIQUE ("auth_user_id")
);

ALTER TABLE "staffs" ENABLE ROW LEVEL SECURITY;

CREATE TABLE "translation_memories" (
  "created_at" timestamp DEFAULT now() NOT NULL,
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "project_id" uuid NOT NULL,
  "source_embedding" extensions.vector (1536) NOT NULL,
  "source_text" text NOT NULL,
  "target_text" text NOT NULL
);

ALTER TABLE "translation_memories" ENABLE ROW LEVEL SECURITY;

CREATE TABLE "works" (
  "created_at" timestamp DEFAULT now() NOT NULL,
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "name" text NOT NULL,
  "project_id" uuid NOT NULL,
  "source_file_name" text DEFAULT '' NOT NULL,
  "status" smallint DEFAULT 1 NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

ALTER TABLE "works" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "glossaries"
ADD CONSTRAINT "glossaries_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "projects" ("id") ON DELETE cascade ON UPDATE no action;

ALTER TABLE "project_members"
ADD CONSTRAINT "project_members_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "projects" ("id") ON DELETE cascade ON UPDATE no action;

ALTER TABLE "project_members"
ADD CONSTRAINT "project_members_user_id_staffs_staff_id_fk" FOREIGN KEY ("user_id") REFERENCES "staffs" ("staff_id") ON DELETE cascade ON UPDATE no action;

ALTER TABLE "segments"
ADD CONSTRAINT "segments_work_id_works_id_fk" FOREIGN KEY ("work_id") REFERENCES "works" ("id") ON DELETE cascade ON UPDATE no action;

ALTER TABLE "translation_memories"
ADD CONSTRAINT "translation_memories_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "projects" ("id") ON DELETE cascade ON UPDATE no action;

ALTER TABLE "works"
ADD CONSTRAINT "works_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "projects" ("id") ON DELETE cascade ON UPDATE no action;

CREATE INDEX "idx_glossaries_project" ON "glossaries" USING btree ("project_id");

CREATE INDEX "idx_projects_owner" ON "projects" USING btree ("owner_user_id");

CREATE INDEX "idx_segments_work_seq" ON "segments" USING btree ("work_id", "seq");

CREATE INDEX "idx_tm_project" ON "translation_memories" USING btree ("project_id");

CREATE INDEX "idx_works_project" ON "works" USING btree ("project_id", "created_at" DESC NULLS LAST);

CREATE INDEX "idx_tm_embedding" ON "translation_memories" USING hnsw ("source_embedding" extensions.vector_cosine_ops);
