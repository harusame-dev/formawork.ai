"use client";

import { Button } from "@workspace/ui/components/button";
import { Lock, Unlock } from "lucide-react";
import { useOptimistic, useTransition } from "react";
import { toggleCustomerMemoryLockAction } from "../toggle-lock/toggle-customer-memory-lock-action";

type CustomerMemoryLockButtonProps = {
	customerId: string;
	isLocked: boolean;
	memoryId: string;
};

export function CustomerMemoryLockButton({
	customerId,
	isLocked,
	memoryId,
}: CustomerMemoryLockButtonProps) {
	const [isPending, startTransition] = useTransition();
	const [optimisticIsLocked, setOptimisticIsLocked] = useOptimistic(isLocked);

	function handleToggle() {
		startTransition(async () => {
			setOptimisticIsLocked(!optimisticIsLocked);
			await toggleCustomerMemoryLockAction({ customerId, memoryId });
		});
	}

	return (
		<Button
			disabled={isPending}
			onClick={handleToggle}
			size="sm"
			variant="ghost"
		>
			{optimisticIsLocked ? (
				<Lock className="h-4 w-4 text-amber-500" />
			) : (
				<Unlock className="h-4 w-4 text-muted-foreground" />
			)}
			<span className="sr-only">
				{optimisticIsLocked ? "ロック解除" : "ロック"}
			</span>
		</Button>
	);
}
