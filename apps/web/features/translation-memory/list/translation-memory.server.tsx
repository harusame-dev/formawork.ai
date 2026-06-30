import type React from "react";
import { getUserStaffId } from "@/features/auth/get-user-staff-id";
import { getTranslationMemories } from "./get-translation-memories";
import { TmCsvExportButton } from "./tm-csv-export-button.client";
import { TranslationMemoryPresenter } from "./translation-memory.universal";

export async function TranslationMemoryContainer(): Promise<React.JSX.Element> {
  const userId = await getUserStaffId();
  const items = userId ? await getTranslationMemories(userId) : [];

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <TmCsvExportButton />
      </div>
      <TranslationMemoryPresenter items={items} />
    </div>
  );
}
