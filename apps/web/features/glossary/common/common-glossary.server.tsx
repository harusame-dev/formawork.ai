import type React from "react";
import { GlossaryTable } from "@/features/glossary/glossary-table.universal";
import { getCommonGlossaries } from "./get-common-glossaries";

export async function CommonGlossaryContainer(): Promise<React.JSX.Element> {
  const glossaries = await getCommonGlossaries();

  return <GlossaryTable glossaries={glossaries} />;
}
