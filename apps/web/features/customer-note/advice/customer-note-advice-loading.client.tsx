"use client";

import type { SelectCustomerNoteAdvice } from "@workspace/db/schema/customer-note-advice";
import { AlertTriangle, Loader2 } from "lucide-react";
import useSWR from "swr";
import { CustomerNoteAdvicePresenter } from "./customer-note-advice.universal";

interface Props {
  noteId: string;
  isTimeout: boolean;
}

const POLLING_INTERVAL = 5000;

async function fetcher(url: string): Promise<SelectCustomerNoteAdvice | null> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to fetch advice");
  }
  return response.json();
}

export function CustomerNoteAdviceLoading({
  noteId,
  isTimeout,
}: Props): JSX.Element {
  const { data: advice, error } = useSWR<SelectCustomerNoteAdvice | null>(
    `/api/customer-notes/${noteId}/advice`,
    fetcher,
    {
      refreshInterval: (data) => (data || isTimeout ? 0 : POLLING_INTERVAL),
      revalidateOnFocus: false,
    },
  );

  if (advice) {
    return <CustomerNoteAdvicePresenter advice={advice} />;
  }

  if (error || isTimeout) {
    return (
      <div className="flex items-center gap-2 text-sm text-destructive">
        <AlertTriangle className="size-4" />
        <span>
          アドバイスの生成中にエラーが発生した可能性があります。ノートを編集して保存すると再生成されます。
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <Loader2 className="size-4 animate-spin" />
      <span>AIアドバイスを生成中です</span>
    </div>
  );
}
