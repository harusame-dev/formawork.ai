import type React from "react";
import { CustomerMemoriesPresenter } from "./customer-memories.universal";
import { getCustomerMemories } from "./get-customer-memories";

interface CustomerMemoriesContainerProps {
  customerIdPromise: Promise<string>;
}

export async function CustomerMemoriesContainer({
  customerIdPromise,
}: CustomerMemoriesContainerProps): Promise<React.JSX.Element> {
  const customerId = await customerIdPromise;
  const memories = await getCustomerMemories(customerId);

  return (
    <CustomerMemoriesPresenter customerId={customerId} memories={memories} />
  );
}
