import type React from "react";
import type { SelectCustomerNoteAdvice } from "@workspace/db/schema/customer-note-advice";
import { CustomerNoteAdvicePresenter } from "./customer-note-advice.universal";
import { CustomerNoteAdviceLoading } from "./customer-note-advice-loading.client";

interface Props {
  advice: SelectCustomerNoteAdvice | null;
  noteId: string;
  isTimeout: boolean;
}

export function CustomerNoteAdviceContainer({
  advice,
  noteId,
  isTimeout,
}: Props): React.JSX.Element {
  if (advice) {
    return <CustomerNoteAdvicePresenter advice={advice} />;
  }

  return <CustomerNoteAdviceLoading isTimeout={isTimeout} noteId={noteId} />;
}
