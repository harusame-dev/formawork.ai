import type React from "react";
import { CustomerSearchForm } from "./customer-search-form.client";
import type { CustomersConditionSearchParams as CustomersConditionSearchParameters } from "./schema";

export async function CustomerSearchFormContainer({
  conditionPromise,
}: {
  conditionPromise: Promise<Omit<CustomersConditionSearchParameters, "page">>;
}): Promise<React.JSX.Element> {
  return <CustomerSearchForm condition={await conditionPromise} />;
}
