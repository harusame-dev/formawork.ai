import { db } from "@workspace/db/client";
import { deletionLogsTable } from "@workspace/db/schema/deletion-logs";

export async function recordDeletion(params: {
	deletedBy: string | null;
	deletedData: Record<string, unknown>;
	recordId: string;
	tableName: "projects" | "tasks";
}) {
	await db.insert(deletionLogsTable).values({
		deletedBy: params.deletedBy,
		deletedData: params.deletedData,
		recordId: params.recordId,
		tableNameText: params.tableName,
	});
}
