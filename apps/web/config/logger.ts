import * as v from "valibot";

export function getLoggerConfig(): {
  deploymentId?: string;
  gitCommitSha?: string;
} {
  return v.parse(
    v.object({
      deploymentId: v.optional(v.string()),
      gitCommitSha: v.optional(v.string()),
    }),
    {
      deploymentId: process.env["VERCEL_DEPLOYMENT_ID"],
      gitCommitSha: process.env["VERCEL_GIT_COMMIT_SHA"],
    },
  );
}
