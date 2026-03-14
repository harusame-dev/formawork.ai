CREATE TABLE "deletion_logs" (
	"deleted_at" timestamp DEFAULT now() NOT NULL,
	"deleted_by" uuid,
	"deleted_data" jsonb NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"record_id" uuid NOT NULL,
	"table_name_text" text NOT NULL
);

ALTER TABLE "deletion_logs" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "projects" (
	"assignee_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"description" text,
	"due_date" date,
	"name" text NOT NULL,
	"project_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

ALTER TABLE "projects" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "tasks" (
	"assignee_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"description" text,
	"due_date" date,
	"name" text NOT NULL,
	"project_id" uuid NOT NULL,
	"status" text NOT NULL,
	"task_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

ALTER TABLE "tasks" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "projects" ADD CONSTRAINT "projects_assignee_id_staffs_staff_id_fk" FOREIGN KEY ("assignee_id") REFERENCES "staffs"("staff_id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_assignee_id_staffs_staff_id_fk" FOREIGN KEY ("assignee_id") REFERENCES "staffs"("staff_id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_project_id_projects_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "projects"("project_id") ON DELETE cascade ON UPDATE no action;
CREATE INDEX "idx_deletion_logs_table_deleted_at" ON "deletion_logs" USING btree ("table_name_text","deleted_at" DESC NULLS LAST);
CREATE INDEX "idx_deletion_logs_deleted_by" ON "deletion_logs" USING btree ("deleted_by");
CREATE INDEX "idx_projects_assignee_id" ON "projects" USING btree ("assignee_id");
CREATE INDEX "idx_projects_due_date" ON "projects" USING btree ("due_date");
CREATE INDEX "idx_projects_name" ON "projects" USING btree ("name");
CREATE INDEX "idx_tasks_project_created" ON "tasks" USING btree ("project_id","created_at" DESC NULLS LAST);
CREATE INDEX "idx_tasks_assignee_id" ON "tasks" USING btree ("assignee_id");
CREATE INDEX "idx_tasks_status" ON "tasks" USING btree ("status");