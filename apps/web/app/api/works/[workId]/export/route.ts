import { db } from "@workspace/db/client";
import { segmentsTable } from "@workspace/db/schema/segment";
import { worksTable } from "@workspace/db/schema/work";
import { asc, eq } from "drizzle-orm";
import { getUserStaffId } from "@/features/auth/get-user-staff-id";
import { getProjectAccess } from "@/features/project/authz";

// UTF-8 BOM。Excel で開いた際の文字化けを防ぐ
const BOM = "\uFEFF";

function escapeCsv(value: string): string {
  return `"${value.replaceAll('"', '""')}"`;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ workId: string }> },
): Promise<Response> {
  const { workId } = await params;
  const userId = await getUserStaffId();

  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  const work = await db.query.worksTable.findFirst({
    where: eq(worksTable.id, workId),
  });

  if (!work) {
    return new Response("Not Found", { status: 404 });
  }

  const access = await getProjectAccess(work.projectId, userId);

  if (!access) {
    return new Response("Not Found", { status: 404 });
  }

  const segments = await db
    .select({
      sourceText: segmentsTable.sourceText,
      targetText: segmentsTable.targetText,
    })
    .from(segmentsTable)
    .where(eq(segmentsTable.workId, workId))
    .orderBy(asc(segmentsTable.seq));

  const rows = [
    "原文,訳文",
    ...segments.map(
      (segment) =>
        `${escapeCsv(segment.sourceText)},${escapeCsv(segment.targetText ?? "")}`,
    ),
  ];
  const csv = `${BOM}${rows.join("\r\n")}`;

  return new Response(csv, {
    headers: {
      "Content-Disposition": 'attachment; filename="bilingual.csv"',
      "Content-Type": "text/csv; charset=utf-8",
    },
  });
}
