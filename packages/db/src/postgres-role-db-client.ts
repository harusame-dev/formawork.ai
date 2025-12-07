import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as v from "valibot";
import * as schema from "./schema";

export const systemManageDatabaseUrl = new URL(
	v.parse(
		v.pipe(
			v.string("databaseUrl は文字列である必要があります"),
			v.url("databaseUrl は URL 形式である必要があります"),
		),
		// biome-ignore lint/complexity/useLiteralKeys: ts(4111)
		process.env["DATABASE_URL"],
	),
);

let db: PostgresJsDatabase<typeof schema>;
export function getPostgresRoleDbClient() {
	if (db) {
		return db;
	}

	const client = postgres(systemManageDatabaseUrl.toString());

	db = drizzle(client, { schema });
	return db;
}
