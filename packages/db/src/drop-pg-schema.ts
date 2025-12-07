import { sql } from "drizzle-orm";
import { db } from "./client";
import { schemaName } from "./pgschema";

async function main() {
	console.log("⭐️ pg スキーマ削除", { schemaName });

	await db.execute(sql.raw(`DROP SCHEMA IF EXISTS ${schemaName} CASCADE`));
}

main()
	.then(() => {
		console.log("✅️ pg スキーマ削除完了");
		process.exit(0);
	})
	.catch((error) => {
		console.log("❌️ pg スキーマ削除失敗", error);
		process.exit(1);
	});
