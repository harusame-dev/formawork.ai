import { CustomerMemoriesPresenter } from "./customer-memories.universal";
import { getCustomerMemories } from "./get-customer-memories";

type CustomerMemoriesContainerProps = {
	customerIdPromise: Promise<string>;
};

export async function CustomerMemoriesContainer({
	customerIdPromise,
}: CustomerMemoriesContainerProps) {
	const customerId = await customerIdPromise;
	const memories = await getCustomerMemories(customerId);

	return (
		<CustomerMemoriesPresenter customerId={customerId} memories={memories} />
	);
}
