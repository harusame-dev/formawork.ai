/** biome-ignore-all lint/complexity/useLiteralKeys: ts(4111) */
import { sql } from "drizzle-orm";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { databaseUrl, db } from "./client";
import { schemaName } from "./pgschema";

async function main() {
	console.log("⭐️ マイグレーション", {
		databaseHost: databaseUrl.hostname,
		databaseName: databaseUrl.pathname,
		databasePort: databaseUrl.port,
		schemaName,
		user: databaseUrl.username,
	});

	// 対象のスキーマにマイグレーションを実施できるように search_path を設定
	await db.execute(sql`SET search_path TO ${sql.identifier(schemaName)}`);

	await migrate(db, {
		migrationsFolder: "./drizzle",
		migrationsSchema: schemaName,
	});

	console.log("✅️ マイグレーション完了");
}

await main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error("❌️ マイグレーション失敗", error);
		process.exit(1);
	});
