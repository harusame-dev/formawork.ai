"use client";

import type React from "react";
import type { SelectCustomerMemory } from "@workspace/db/schema/customer-memory";
import { DeleteCustomerMemoryDialog } from "@/features/customer-memory/delete/delete-customer-memory-dialog.client";
import { EditCustomerMemoryDialog } from "@/features/customer-memory/edit/edit-customer-memory-dialog.client";
import { CustomerMemoryLockButton } from "./customer-memory-lock-button.client";

interface CustomerMemoryActionButtonsProps {
  customerId: string;
  memory: SelectCustomerMemory;
}

export function CustomerMemoryActionButtons({
  customerId,
  memory,
}: CustomerMemoryActionButtonsProps): React.JSX.Element {
  return (
    <div className="flex items-center gap-1">
      <EditCustomerMemoryDialog customerId={customerId} memory={memory} />
      <DeleteCustomerMemoryDialog
        customerId={customerId}
        memoryId={memory.id}
      />
      <CustomerMemoryLockButton
        isProtected={memory.isProtected}
        memoryId={memory.id}
      />
    </div>
  );
}
