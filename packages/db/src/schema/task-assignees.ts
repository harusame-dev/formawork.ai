import { pgSchema, primaryKey, uuid } from "drizzle-orm/pg-core";
import { schemaName } from "../pgschema";
import { staffsTable } from "./staff";
import { tasksTable } from "./tasks";

export const taskAssigneesTable = pgSchema(schemaName)
	.table(
		"task_assignees",
		{
			staffId: uuid("staff_id")
				.notNull()
				.references(() => staffsTable.staffId, { onDelete: "cascade" }),
			taskId: uuid("task_id")
				.notNull()
				.references(() => tasksTable.taskId, { onDelete: "cascade" }),
		},
		(t) => [primaryKey({ columns: [t.taskId, t.staffId] })],
	)
	.enableRLS();
