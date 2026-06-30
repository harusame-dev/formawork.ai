import { getUserStaffId } from "@/features/auth/get-user-staff-id";
import { getTranslationMemories } from "@/features/translation-memory/list/get-translation-memories";

function escapeCsvField(value: string): string {
  return `"${value.replaceAll('"', '""')}"`;
}

export async function GET(): Promise<Response> {
  const userId = await getUserStaffId();

  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  const items = await getTranslationMemories(userId);

  const header = "原文,訳文,プロジェクト\n";
  const rows = items
    .map(
      (item) =>
        `${escapeCsvField(item.sourceText)},${escapeCsvField(item.targetText)},${escapeCsvField(item.projectName)}`,
    )
    .join("\n");

  const bom = "﻿";
  const csv = bom + header + rows;

  return new Response(csv, {
    headers: {
      "Content-Disposition": 'attachment; filename="translation-memory.csv"',
      "Content-Type": "text/csv; charset=utf-8",
    },
  });
}
