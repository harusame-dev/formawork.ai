import { sql } from "drizzle-orm";
import { schemaName } from "./pgschema";
import { getPostgresRoleDbClient } from "./postgres-role-db-client";

async function main() {
	console.log("⭐️ pg スキーマ削除", { schemaName });

	const db = getPostgresRoleDbClient();

	const result = await db.execute(
		sql.raw(`DROP SCHEMA IF EXISTS ${schemaName} CASCADE`),
	);
	console.log("✅️ pg スキーマ削除完了", { ...result });
}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.log(error);
		process.exit(1);
	});
