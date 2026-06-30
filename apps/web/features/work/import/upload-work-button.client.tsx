"use client";

import type React from "react";
import { Button } from "@workspace/ui/components/button";
import { Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { importWorkAction } from "./import-work.action";

export function UploadWorkButton({
  projectId,
}: {
  projectId: string;
}): React.JSX.Element {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function handleChange(event: React.ChangeEvent<HTMLInputElement>): void {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    if (!file.name.toLowerCase().endsWith(".docx")) {
      setErrorMessage("docx ファイルを選択してください");
      return;
    }

    setErrorMessage(null);
    startTransition(async () => {
      const result = await importWorkAction({ file, projectId });
      if (!result.success) {
        setErrorMessage(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <input
        accept=".docx"
        className="hidden"
        onChange={handleChange}
        ref={inputRef}
        type="file"
      />
      <Button
        disabled={isPending}
        isProcessing={isPending}
        onClick={() => inputRef.current?.click()}
        processingLabel="取り込み中"
        size="sm"
        variant="outline"
      >
        <Upload className="size-4" />
        ドキュメントを取り込む（.docx）
      </Button>
      {errorMessage && (
        <span className="text-xs text-destructive" role="alert">
          {errorMessage}
        </span>
      )}
    </div>
  );
}
