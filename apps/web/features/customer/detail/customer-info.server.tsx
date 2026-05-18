import { notFound } from "next/navigation";
import { CustomerInfoPresenter } from "./customer-info.universal";
import { getCustomerDetail } from "./get-customer-detail";

interface CustomerInfoContainerProps {
  customerIdPromise: Promise<string>;
}

export async function CustomerInfoContainer({
  customerIdPromise,
}: CustomerInfoContainerProps): Promise<JSX.Element> {
  const customer = await getCustomerDetail(await customerIdPromise);

  if (!customer) {
    notFound();
  }

  return (
    <CustomerInfoPresenter
      firstName={customer.firstName}
      lastName={customer.lastName}
    />
  );
}
