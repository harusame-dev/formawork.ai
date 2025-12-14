import type { ReactNode } from "react";
import { RegisterCustomerMemoryDialog } from "./register-customer-memory-dialog";

type RegisterCustomerMemoryDialogContainerProps = {
	customerId: Promise<string>;
};

export async function RegisterCustomerMemoryDialogContainer({
	customerId,
}: RegisterCustomerMemoryDialogContainerProps): Promise<ReactNode> {
	const resolvedCustomerId = await customerId;

	return <RegisterCustomerMemoryDialog customerId={resolvedCustomerId} />;
}
