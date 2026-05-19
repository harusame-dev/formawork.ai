import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as v from "valibot";
import * as schema from "./schema";

export const databaseUrl = new URL(
  v.parse(
    v.pipe(
      v.string("databaseUrl は文字列である必要があります"),
      v.url("databaseUrl は URL 形式である必要があります"),
    ),
    process.env["DATABASE_URL"],
  ),
);

const globalForDb = global as unknown as {
  db: PostgresJsDatabase<typeof schema>;
};

const client = postgres(databaseUrl.toString());

export const db = globalForDb.db || drizzle(client, { schema });

if (process.env["NODE_ENV"] !== "production") globalForDb.db = db;

export type DbClient = typeof db;
export type DbExecutor =
  | typeof db
  | Parameters<Parameters<typeof db.transaction>[0]>[0];
