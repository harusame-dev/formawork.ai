"use client";

import type { SelectCustomerMemory } from "@workspace/db/schema/customer-memory";
import { Button } from "@workspace/ui/components/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@workspace/ui/components/dialog";
import { Edit } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CustomerMemoryEditForm } from "../customer-memory-edit-form";

type EditCustomerMemoryDialogProps = {
	customerId: string;
	memory: SelectCustomerMemory;
};

export function EditCustomerMemoryDialog({
	customerId,
	memory,
}: EditCustomerMemoryDialogProps) {
	const router = useRouter();
	const [open, setOpen] = useState(false);
	const [formKey, setFormKey] = useState(0);

	function handleOpenChange(open: boolean) {
		if (!open) {
			setFormKey((prev) => prev + 1);
		}
		setOpen(open);
	}

	return (
		<Dialog onOpenChange={handleOpenChange} open={open}>
			<DialogTrigger asChild>
				<Button size="sm" type="button" variant="ghost">
					<Edit aria-hidden className="size-4" />
					<span className="sr-only">編集</span>
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>メモリを編集</DialogTitle>
					<DialogDescription>メモリの内容を更新します</DialogDescription>
				</DialogHeader>

				<CustomerMemoryEditForm
					customerId={customerId}
					defaultValues={{
						category: String(memory.category),
						content: memory.content,
						importance: String(memory.importance),
					}}
					key={formKey}
					memoryId={memory.id}
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
