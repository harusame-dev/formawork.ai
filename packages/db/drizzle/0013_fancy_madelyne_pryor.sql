CREATE TABLE "project_assignees" (
	"project_id" uuid NOT NULL,
	"staff_id" uuid NOT NULL,
	CONSTRAINT "project_assignees_project_id_staff_id_pk" PRIMARY KEY("project_id","staff_id")
);

ALTER TABLE "project_assignees" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "task_assignees" (
	"staff_id" uuid NOT NULL,
	"task_id" uuid NOT NULL,
	CONSTRAINT "task_assignees_task_id_staff_id_pk" PRIMARY KEY("task_id","staff_id")
);

ALTER TABLE "task_assignees" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "projects" DROP CONSTRAINT "projects_assignee_id_staffs_staff_id_fk";

ALTER TABLE "tasks" DROP CONSTRAINT "tasks_assignee_id_staffs_staff_id_fk";

DROP INDEX "idx_projects_assignee_id";
DROP INDEX "idx_tasks_assignee_id";
ALTER TABLE "project_assignees" ADD CONSTRAINT "project_assignees_project_id_projects_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "projects"("project_id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "project_assignees" ADD CONSTRAINT "project_assignees_staff_id_staffs_staff_id_fk" FOREIGN KEY ("staff_id") REFERENCES "staffs"("staff_id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "task_assignees" ADD CONSTRAINT "task_assignees_staff_id_staffs_staff_id_fk" FOREIGN KEY ("staff_id") REFERENCES "staffs"("staff_id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "task_assignees" ADD CONSTRAINT "task_assignees_task_id_tasks_task_id_fk" FOREIGN KEY ("task_id") REFERENCES "tasks"("task_id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "projects" DROP COLUMN "assignee_id";
ALTER TABLE "tasks" DROP COLUMN "assignee_id";