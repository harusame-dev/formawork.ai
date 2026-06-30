import type React from "react";
import { RegisterGlossaryDialog } from "@/features/glossary/register/register-glossary-dialog.client";

export function CommonGlossaryHeader(): React.JSX.Element {
  return (
    <div className="flex justify-end">
      <RegisterGlossaryDialog />
    </div>
  );
}
