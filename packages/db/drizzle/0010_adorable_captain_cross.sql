CREATE TABLE "local"."task_comments" (
	"author_id" uuid NOT NULL,
	"comment_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"task_id" uuid NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

ALTER TABLE "local"."task_comments" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "local"."task_comments" ADD CONSTRAINT "task_comments_author_id_staffs_staff_id_fk" FOREIGN KEY ("author_id") REFERENCES "local"."staffs"("staff_id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "local"."task_comments" ADD CONSTRAINT "task_comments_task_id_tasks_task_id_fk" FOREIGN KEY ("task_id") REFERENCES "local"."tasks"("task_id") ON DELETE cascade ON UPDATE no action;
CREATE INDEX "idx_task_comments_task_created" ON "local"."task_comments" USING btree ("task_id","created_at");