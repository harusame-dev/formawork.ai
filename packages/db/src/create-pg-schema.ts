import { sql } from "drizzle-orm";
import { schemaName } from "./pgschema";
import { getPostgresRoleDbClient } from "./postgres-role-db-client";

async function main() {
	console.log("⭐️ pg スキーマ作成", { schemaName });

	const db = getPostgresRoleDbClient();
	const result = await db.execute(
		sql.raw(`CREATE SCHEMA IF NOT EXISTS ${schemaName}`),
	);
	console.log("✅️ pg スキーマ作成完了", result);
}

await main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.log(error);
		process.exit(1);
	});
