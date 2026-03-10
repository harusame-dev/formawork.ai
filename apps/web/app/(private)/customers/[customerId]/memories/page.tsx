import { Suspense } from "react";
import { CustomerMemoriesContainer } from "@/features/customer-memory/list/customer-memories.server";
import { CustomerMemoriesSkeleton } from "@/features/customer-memory/list/customer-memories-skeleton.universal";

export default async function CustomerMemoriesPage({
	params,
}: PageProps<"/customers/[customerId]/memories">) {
	const customerIdPromise = params.then(({ customerId }) => customerId);

	return (
		<Suspense fallback={<CustomerMemoriesSkeleton />}>
			<CustomerMemoriesContainer customerIdPromise={customerIdPromise} />
		</Suspense>
	);
}
