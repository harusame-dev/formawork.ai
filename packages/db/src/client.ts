import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { systemManageDatabaseUrl } from "./postgres-role-db-client";
import * as schema from "./schema";

export const databaseUrl = new URL(systemManageDatabaseUrl);

const globalForDb = global as unknown as {
	db: PostgresJsDatabase<typeof schema>;
};

const client = postgres(databaseUrl.toString());

export const db = globalForDb.db || drizzle(client, { schema });

// biome-ignore lint/complexity/useLiteralKeys: ts(4111)
if (process.env["NODE_ENV"] !== "production") globalForDb.db = db;

export type DbClient = typeof db;
