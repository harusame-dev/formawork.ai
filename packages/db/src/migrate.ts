import { sql } from "drizzle-orm";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { databaseUrl } from "./client";
import { schemaName } from "./pgschema";
import { getPostgresRoleDbClient } from "./postgres-role-db-client";

async function main() {
	console.log("⭐️ マイグレーション", {
		databaseHost: databaseUrl.hostname,
		databaseName: databaseUrl.pathname,
		databasePort: databaseUrl.port,
		schemaName,
		user: databaseUrl.username,
	});

	const db = getPostgresRoleDbClient();

	// 対象のスキーマにマイグレーションを実施できるように search_path を設定
	await db.execute(sql.raw(`SET search_path TO ${schemaName}`));

	await migrate(db, {
		migrationsFolder: "./drizzle",
		migrationsSchema: schemaName,
	});

	console.log("✅️ マイグレーション完了");
}

await main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error("Migration failed:", error);
		process.exit(1);
	});
