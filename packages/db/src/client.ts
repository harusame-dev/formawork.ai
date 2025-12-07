import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { pgRoleName } from "./pgrole";
import { schemaName } from "./pgschema";
import { systemManageDatabaseUrl } from "./postgres-role-db-client";
import * as schema from "./schema";

export const databaseUrl = new URL(systemManageDatabaseUrl);
databaseUrl.username = pgRoleName;

const globalForDb = global as unknown as {
	db: PostgresJsDatabase<typeof schema>;
};
databaseUrl.username = `${schemaName}_user`;

const client = postgres(databaseUrl.toString());

export const db = globalForDb.db || drizzle(client, { schema });

// biome-ignore lint/complexity/useLiteralKeys: ts(4111)
if (process.env["NODE_ENV"] !== "production") globalForDb.db = db;

export type DbClient = typeof db;
