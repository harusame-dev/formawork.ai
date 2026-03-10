import type { ReactNode } from "react";
import { RegisterCustomerNoteDialog } from "./register-customer-note-dialog.client";

type RegisterCustomerNoteDialogContainerProps = {
	customerId: Promise<string>;
};

export async function RegisterCustomerNoteDialogContainer({
	customerId,
}: RegisterCustomerNoteDialogContainerProps): Promise<ReactNode> {
	const resolvedCustomerId = await customerId;

	return <RegisterCustomerNoteDialog customerId={resolvedCustomerId} />;
}
