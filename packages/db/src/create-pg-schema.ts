import { sql } from "drizzle-orm";
import { db } from "./client";
import { schemaName } from "./pgschema";

async function main() {
	console.log("⭐️ pg スキーマ作成", { schemaName });

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
