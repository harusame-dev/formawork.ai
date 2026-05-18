"use client";

import { Button } from "@workspace/ui/components/button";
import { Lock, Unlock } from "lucide-react";
import { useOptimistic, useTransition } from "react";
import { toggleCustomerMemoryLockAction } from "@/features/customer-memory/toggle-lock/toggle-customer-memory-lock.action";

interface CustomerMemoryLockButtonProps {
  isProtected: boolean;
  memoryId: string;
}

export function CustomerMemoryLockButton({
  isProtected,
  memoryId,
}: CustomerMemoryLockButtonProps): JSX.Element {
  const [isPending, startTransition] = useTransition();
  const [optimisticIsProtected, setOptimisticIsProtected] =
    useOptimistic(isProtected);

  function handleToggle(): void {
    startTransition(async () => {
      setOptimisticIsProtected(!optimisticIsProtected);
      await toggleCustomerMemoryLockAction({ memoryId });
    });
  }

  return (
    <Button
      disabled={isPending}
      onClick={handleToggle}
      size="sm"
      variant="ghost"
    >
      {optimisticIsProtected ? (
        <Lock className="size-4 text-amber-500" />
      ) : (
        <Unlock className="size-4 text-muted-foreground" />
      )}
      <span className="sr-only">
        {optimisticIsProtected ? "保護解除" : "保護"}
      </span>
    </Button>
  );
}
