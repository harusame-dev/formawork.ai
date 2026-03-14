import { pgSchema, primaryKey, uuid } from "drizzle-orm/pg-core";
import { schemaName } from "../pgschema";
import { projectsTable } from "./projects";
import { staffsTable } from "./staff";

export const projectAssigneesTable = pgSchema(schemaName)
	.table(
		"project_assignees",
		{
			projectId: uuid("project_id")
				.notNull()
				.references(() => projectsTable.projectId, { onDelete: "cascade" }),
			staffId: uuid("staff_id")
				.notNull()
				.references(() => staffsTable.staffId, { onDelete: "cascade" }),
		},
		(t) => [primaryKey({ columns: [t.projectId, t.staffId] })],
	)
	.enableRLS();
