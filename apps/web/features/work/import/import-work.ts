import { fail, type Result, succeed } from "@harusame0616/result";
import { db } from "@workspace/db/client";
import { SegmentStatus, segmentsTable } from "@workspace/db/schema/segment";
import { WorkStatus, worksTable } from "@workspace/db/schema/work";
import { v7 as uuidv7 } from "uuid";
import { canEditProject, getProjectAccess } from "@/features/project/authz";
import { extractParagraphs } from "./extract-docx.server";
import { splitIntoSegments } from "./split-into-segments";

const PROJECT_NOT_FOUND_ERROR = "プロジェクトが見つかりません" as const;
const FORBIDDEN_ERROR = "この操作を実行する権限がありません" as const;
const EXTRACT_FAILED_ERROR =
  "ファイルの読み込みに失敗しました。docx 形式か確認してください" as const;
const NO_TEXT_ERROR = "ドキュメントから本文を抽出できませんでした" as const;

type ErrorMessage =
  | typeof PROJECT_NOT_FOUND_ERROR
  | typeof FORBIDDEN_ERROR
  | typeof EXTRACT_FAILED_ERROR
  | typeof NO_TEXT_ERROR;

export async function importWork({
  fileBuffer,
  fileName,
  projectId,
  userId,
}: {
  fileBuffer: Buffer;
  fileName: string;
  projectId: string;
  userId: string;
}): Promise<Result<{ workId: string }, ErrorMessage>> {
  const access = await getProjectAccess(projectId, userId);

  if (!access) {
    return fail(PROJECT_NOT_FOUND_ERROR);
  }

  if (!canEditProject(access)) {
    return fail(FORBIDDEN_ERROR);
  }

  let paragraphs: string[];
  try {
    paragraphs = await extractParagraphs(fileBuffer);
  } catch {
    return fail(EXTRACT_FAILED_ERROR);
  }

  const segments = splitIntoSegments(paragraphs);

  if (segments.length === 0) {
    return fail(NO_TEXT_ERROR);
  }

  const workId = uuidv7();
  const name = fileName.replace(/\.docx$/iu, "");

  await db.transaction(async (tx) => {
    await tx.insert(worksTable).values({
      id: workId,
      name,
      projectId,
      sourceFileName: fileName,
      status: WorkStatus.NotStarted,
    });

    await tx.insert(segmentsTable).values(
      segments.map((sourceText, index) => ({
        seq: index + 1,
        sourceText,
        status: SegmentStatus.Untranslated,
        workId,
      })),
    );
  });

  return succeed({ workId });
}
