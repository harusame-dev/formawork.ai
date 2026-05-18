"use client";

import { Button } from "@workspace/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CustomerMemoryEditForm } from "@/features/customer-memory/customer-memory-edit-form.client";

interface RegisterCustomerMemoryDialogProps {
  customerId: string;
}

export function RegisterCustomerMemoryDialog({
  customerId,
}: RegisterCustomerMemoryDialogProps): JSX.Element {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [formKey, setFormKey] = useState(0);

  function handleOpenChange(open: boolean): void {
    if (!open) {
      setFormKey((previous) => previous + 1);
    }
    setOpen(open);
  }

  return (
    <Dialog onOpenChange={handleOpenChange} open={open}>
      <DialogTrigger asChild>
        <Button size="sm">メモリを追加</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>メモリを追加</DialogTitle>
          <DialogDescription>
            顧客に関する重要な情報を記録します
          </DialogDescription>
        </DialogHeader>

        <CustomerMemoryEditForm
          customerId={customerId}
          key={formKey}
          onCancel={() => handleOpenChange(false)}
          onSuccess={() => {
            setOpen(false);
            router.refresh();
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
