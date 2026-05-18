import { CustomersPresenter } from "./customers.universal";
import { getCustomers } from "./get-customers";
import type { CustomersCondition } from "./schema";

export async function CustomersContainer({
  condition,
}: {
  condition: Promise<CustomersCondition>;
}): Promise<JSX.Element> {
  const { customers, page, totalPages } = await getCustomers(await condition);

  return (
    <CustomersPresenter
      customers={customers.map(
        ({ customerId, firstName, lastName, phone, email }) => ({
          customerId,
          email,
          firstName,
          lastName,
          phone,
        }),
      )}
      page={page}
      totalPages={totalPages}
    />
  );
}
