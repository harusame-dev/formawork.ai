import { sql } from "drizzle-orm";
import { pgRoleName, pgRolePassword } from "./pgrole";
import { schemaName } from "./pgschema";
import { getPostgresRoleDbClient } from "./postgres-role-db-client";

async function main() {
	console.log("⭐️ pg ロール作成", { pgRoleName, schemaName });

	const db = getPostgresRoleDbClient();

	const [exists] = await db.execute(
		sql.raw(
			`SELECT true AS EXISTS FROM pg_roles WHERE rolname = '${pgRoleName}'`,
		),
	);
	if (exists) {
		console.log("✅️ pg ロール作成済み", { pgRoleName });
		return;
	}

	// ロール作成
	await db.execute(
		sql.raw(`CREATE ROLE ${pgRoleName} LOGIN PASSWORD '${pgRolePassword}'`),
	);

	// DB接続権限付与
	await db.execute(
		sql.raw(`GRANT CONNECT ON DATABASE postgres TO ${pgRoleName}`),
	);

	// スキーマの使用権限付与
	await db.execute(
		sql.raw(`GRANT USAGE ON SCHEMA ${schemaName} TO ${pgRoleName}`),
	);

	// 全テーブルの操作権限付与
	await db.execute(
		sql.raw(
			`GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA ${schemaName} TO ${pgRoleName};`,
		),
	);

	// 新しく作成されたオブジェクトに対して自動で権限付与
	await db.execute(
		sql.raw(
			`ALTER DEFAULT PRIVILEGES IN SCHEMA ${schemaName} GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO ${pgRoleName};`,
		),
	);

	// ロールの search_path を設定
	await db.execute(
		sql.raw(`ALTER ROLE ${pgRoleName} SET search_path TO ${schemaName}`),
	);
}

await main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.log(error);
		process.exit(1);
	});
