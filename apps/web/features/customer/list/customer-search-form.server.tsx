import { CustomerSearchForm } from "./customer-search-form.client";
import type { CustomersConditionSearchParams } from "./schema";

export async function CustomerSearchFormContainer({
	conditionPromise,
}: {
	conditionPromise: Promise<Omit<CustomersConditionSearchParams, "page">>;
}) {
	return <CustomerSearchForm condition={await conditionPromise} />;
}
