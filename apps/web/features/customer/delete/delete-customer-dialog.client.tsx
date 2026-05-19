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
import { AlertCircle } from "lucide-react";
import { useState, useTransition } from "react";
import { deleteCustomerAction } from "./delete-customer.action";

interface DeleteCustomerDialogProps {
  customerId: string;
}

export function DeleteCustomerDialog({
  customerId,
}: DeleteCustomerDialogProps): React.JSX.Element {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function handleDelete(): void {
    setErrorMessage(null);

    startTransition(async () => {
      const result = await deleteCustomerAction({ customerId });

      if (!result.success) {
        setErrorMessage(result.error);
        return;
      }

      setErrorMessage(null);
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
        <Button size="sm" type="button" variant="destructive">
          削除
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>顧客を削除</DialogTitle>
          <DialogDescription>
            この顧客を削除してもよろしいですか？関連するすべてのノートと画像も削除されます。この操作は取り消せません。
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
