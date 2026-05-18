import { notFound } from "next/navigation";
import { CustomerBasicInfoPresenter } from "./customer-basic-info.universal";
import { getCustomerDetail } from "./get-customer-detail";

interface CustomerBasicInfoContainerProps {
  customerIdPromise: Promise<string>;
}

export async function CustomerBasicInfoContainer({
  customerIdPromise,
}: CustomerBasicInfoContainerProps): Promise<JSX.Element> {
  const customer = await getCustomerDetail(await customerIdPromise);

  if (!customer) {
    notFound();
  }

  return <CustomerBasicInfoPresenter customer={customer} />;
}
