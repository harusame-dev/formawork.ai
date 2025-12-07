import { sql } from "drizzle-orm";
import { db } from "./client";
import { schemaName } from "./pgschema";

async function main() {
	console.log("⭐️ pg スキーマ作成", { schemaName });

	await db.execute(sql.raw(`CREATE SCHEMA IF NOT EXISTS ${schemaName}`));
}

await main()
	.then(() => {
		console.log("✅️ pg スキーマ作成完了");
		process.exit(0);
	})
	.catch((error) => {
		console.log("❌️ pg スキーマ作成失敗", error);
		process.exit(1);
	});
