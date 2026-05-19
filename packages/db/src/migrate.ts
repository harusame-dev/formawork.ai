/** biome-ignore-all lint/complexity/useLiteralKeys: ts(4111) */
import { sql } from "drizzle-orm";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import * as v from "valibot";
import { databaseUrl, db } from "./client";
import { schemaName } from "./pgschema";
import { ADVICE_QUEUE_NAME, MEMORY_QUEUE_NAME } from "./queue-names";

const ADVICE_CRON_JOB_NAME = `${schemaName}_generate-advice-cron`;
const MEMORY_CRON_JOB_NAME = `${schemaName}_generate-memory-cron`;

const cronConfig = v.parse(
  v.pipe(
    v.union([
      v.object({
        cronSecret: v.pipe(
          v.string("CRON_SECRET は文字列である必要があります"),
          v.minLength(1, "CRON_SECRET は必須です"),
        ),
        environment: v.literal("production"),
        vercelUrl: v.pipe(
          v.string("VERCEL_URL は文字列である必要があります"),
          v.minLength(1, "VERCEL_URL は必須です"),
        ),
      }),
      v.object({
        environment: v.literal("preview"),
      }),
      v.object({
        environment: v.optional(v.literal("local"), "local"),
      }),
    ]),
    v.transform((result) => {
      const environment = result.environment;
      switch (environment) {
        case "local":
          return { cronSecret: "", url: "http://host.docker.internal:3000" };
        case "preview":
          return { cronSecret: "", url: "" };
        case "production":
          return {
            cronSecret: result.cronSecret,
            url: `https://${result.vercelUrl}`,
          };
        default:
          throw new Error(
            `Unexpected environment: ${environment satisfies never}`,
          );
      }
    }),
  ),
  {
    cronSecret: process.env["CRON_SECRET"],
    environment: process.env["VERCEL_ENV"],
    vercelUrl: process.env["VERCEL_URL"],
  },
);
async function setupPgmqQueue() {
  console.log("⭐️ pgmqキュー作成");

  await createQueueIfNotExists(ADVICE_QUEUE_NAME);
  await createQueueIfNotExists(MEMORY_QUEUE_NAME);
}

async function setupCronJob() {
  console.log("⭐️ pg_cronジョブ設定");

  if (!cronConfig.url) {
    // preview 環境でも cron スケジュールを設定するとプレビューごとに AI 実行のリクエストが飛ぶようになってしまい
    // リクエスト数を消費しすぎてしまうためジョブは設定しない
    // デメリットとしてプレビュー環境では自動で AI 生成ができない
    // 手動で /api/cron/generate-* にリクエストを投げることで対応可能
    console.log("⏩️ pg_cronジョブ設定をスキップ");
    return;
  }

  // ローカル環境では1分ごと、本番環境では10分ごと
  // ローカル環境ではリクエスト数が多くても問題ないので DX を考慮して短い間隔に
  const isLocal = cronConfig.cronSecret === "";
  const schedule = isLocal ? "*/1 * * * *" : "*/10 * * * *";

  // アドバイス生成
  await scheduleCronJob(
    ADVICE_CRON_JOB_NAME,
    schedule,
    "/api/cron/generate-advice",
  );

  // メモリー生成
  await scheduleCronJob(
    MEMORY_CRON_JOB_NAME,
    schedule,
    "/api/cron/generate-memory",
  );
}

async function createQueueIfNotExists(queueName: string) {
  const result = (await db.execute(sql`
		SELECT EXISTS (
			SELECT 1 FROM pgmq.meta WHERE queue_name = ${queueName}
		) as exists
	`)) as unknown as { exists: boolean }[];

  if (result[0]?.exists) {
    console.log(`  ⏭️ キュー "${queueName}" は既に存在します`);
    return;
  }

  await db.execute(sql`SELECT pgmq.create(${queueName})`);
  console.log(`  ✅️ キュー "${queueName}" を作成しました`);
}

async function scheduleCronJob(
  jobName: string,
  schedule: string,
  endpoint: string,
) {
  const headers = {
    Authorization: `Bearer ${cronConfig.cronSecret}`,
  };

  await db.execute(sql`SELECT cron.unschedule(${jobName})`).catch(() => {
    // ジョブが存在しない場合はエラーを無視
  });

  await db.execute(
    sql.raw(`
			SELECT cron.schedule(
				'${jobName}',
				'${schedule}',
				$$
				SELECT net.http_get(
					url := '${cronConfig.url}${endpoint}',
					headers := '${JSON.stringify(headers)}'::jsonb
				) AS request_id;
				$$
			)
		`),
  );

  console.log(
    `  ✅️ cronジョブ "${jobName}" を設定しました (schedule: ${schedule}, URL: ${cronConfig.url}${endpoint})`,
  );
}

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

  // pgmqキューの作成
  await setupPgmqQueue();

  // pg_cronジョブの設定
  await setupCronJob();
}

await main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌️ マイグレーション失敗", error);
    process.exit(1);
  });
