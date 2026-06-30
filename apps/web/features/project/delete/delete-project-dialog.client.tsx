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
import { useState, useTransition } from "react";
import { deleteProjectAction } from "./delete-project.action";

export function DeleteProjectDialog({
  projectId,
  projectName,
}: {
  projectId: string;
  projectName: string;
}): React.JSX.Element {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function handleDelete(): void {
    setErrorMessage(null);
    startTransition(async () => {
      const result = await deleteProjectAction({ projectId });
      if (!result.success) {
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
          <DialogTitle>プロジェクトを削除</DialogTitle>
          <DialogDescription>
            「{projectName}」を削除します。ワーク・セグメント・翻訳メモリ・
            用語集も含めてすべて削除され、元に戻せません。
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
