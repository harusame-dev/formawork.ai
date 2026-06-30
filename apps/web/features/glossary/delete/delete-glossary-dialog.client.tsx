"use client";

import type React from "react";
import { Button } from "@workspace/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog";
import { AlertCircle, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { deleteGlossaryAction } from "./delete-glossary.action";

export function DeleteGlossaryDialog({
  glossaryId,
  sourceTerm,
}: {
  glossaryId: string;
  sourceTerm: string;
}): React.JSX.Element {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const router = useRouter();

  function handleDelete(): void {
    setErrorMessage(null);
    startTransition(async () => {
      const result = await deleteGlossaryAction({ glossaryId });
      if (result.success) {
        setOpen(false);
        router.refresh();
      } else {
        setErrorMessage(result.error);
      }
    });
  }

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Trash2 className="size-4" />
          削除
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>用語を削除</DialogTitle>
          <DialogDescription>
            「{sourceTerm}」を削除します。この操作は元に戻せません。
          </DialogDescription>
        </DialogHeader>
        {errorMessage && (
          <div
            className="flex items-center gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive"
            role="alert"
          >
            <AlertCircle className="size-4" />
            {errorMessage}
          </div>
        )}
        <DialogFooter>
          <Button
            disabled={isPending}
            onClick={() => setOpen(false)}
            variant="outline"
          >
            キャンセル
          </Button>
          <Button
            disabled={isPending}
            isProcessing={isPending}
            onClick={handleDelete}
            processingLabel="削除中"
            variant="destructive"
          >
            削除する
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
