CREATE TABLE "task_activities" (
	"activity_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"author_id" uuid NOT NULL,
	"content" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"metadata" jsonb,
	"task_id" uuid NOT NULL,
	"type" text NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

ALTER TABLE "task_activities" ENABLE ROW LEVEL SECURITY;
INSERT INTO "task_activities" (activity_id, task_id, type, author_id, content, created_at, updated_at)
SELECT comment_id, task_id, 'comment', author_id, content, created_at, updated_at
FROM "task_comments";
DROP TABLE "task_comments" CASCADE;
ALTER TABLE "task_activities" ADD CONSTRAINT "task_activities_author_id_staffs_staff_id_fk" FOREIGN KEY ("author_id") REFERENCES "staffs"("staff_id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "task_activities" ADD CONSTRAINT "task_activities_task_id_tasks_task_id_fk" FOREIGN KEY ("task_id") REFERENCES "tasks"("task_id") ON DELETE cascade ON UPDATE no action;
CREATE INDEX "idx_task_activities_task_created" ON "task_activities" USING btree ("task_id","created_at");