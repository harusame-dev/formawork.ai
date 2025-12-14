"use client";

import type { SelectCustomerMemory } from "@workspace/db/schema/customer-memory";
import { DeleteCustomerMemoryDialog } from "../delete/delete-customer-memory-dialog";
import { EditCustomerMemoryDialog } from "../edit/edit-customer-memory-dialog";
import { CustomerMemoryLockButton } from "./customer-memory-lock-button";

type CustomerMemoryActionButtonsProps = {
	customerId: string;
	memory: SelectCustomerMemory;
};

export function CustomerMemoryActionButtons({
	customerId,
	memory,
}: CustomerMemoryActionButtonsProps) {
	return (
		<div className="flex items-center gap-1">
			<EditCustomerMemoryDialog customerId={customerId} memory={memory} />
			<DeleteCustomerMemoryDialog
				customerId={customerId}
				memoryId={memory.id}
			/>
			<CustomerMemoryLockButton
				customerId={customerId}
				isProtected={memory.isProtected}
				memoryId={memory.id}
			/>
		</div>
	);
}
