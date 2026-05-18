"use client";

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
import { deleteCustomerMemoryAction } from "./delete-customer-memory.action";

interface DeleteCustomerMemoryDialogProps {
  customerId: string;
  memoryId: string;
}

export function DeleteCustomerMemoryDialog({
  customerId,
  memoryId,
}: DeleteCustomerMemoryDialogProps): JSX.Element {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function handleDelete(): void {
    setErrorMessage(null);

    startTransition(async () => {
      const result = await deleteCustomerMemoryAction({
        customerId,
        memoryId,
      });

      if (!result.success) {
        setErrorMessage(result.error);
        return;
      }

      setErrorMessage(null);
      setOpen(false);
      router.refresh();
    });
  }

  function handleOpenChange(open: boolean): void {
    if (!open) {
      setErrorMessage(null);
    }
    setOpen(open);
  }

  return (
    <Dialog onOpenChange={handleOpenChange} open={open}>
      <DialogTrigger asChild>
        <Button size="sm" type="button" variant="ghost">
          <Trash2 aria-hidden className="size-4" />
          <span className="sr-only">削除</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>メモリを削除</DialogTitle>
          <DialogDescription>
            このメモリを削除してもよろしいですか？この操作は取り消せません。
          </DialogDescription>
        </DialogHeader>

        {errorMessage && (
          <div className="flex items-center gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            <AlertCircle className="size-4 shrink-0" />
            <p>{errorMessage}</p>
          </div>
        )}

        <DialogFooter>
          <Button
            disabled={isPending}
            onClick={() => handleOpenChange(false)}
            type="button"
            variant="outline"
          >
            キャンセル
          </Button>
          <Button
            className="min-w-[120px]"
            isProcessing={isPending}
            onClick={handleDelete}
            processingLabel="削除中"
            type="button"
            variant="destructive"
          >
            削除
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
