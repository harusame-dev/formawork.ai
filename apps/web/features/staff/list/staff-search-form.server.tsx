import type { StaffsConditionSearchParams as StaffsConditionSearchParameters } from "./schema";
import { StaffSearchForm } from "./staff-search-form.client";

export async function StaffSearchFormContainer({
  conditionPromise,
}: {
  conditionPromise: Promise<Omit<StaffsConditionSearchParameters, "page">>;
}): Promise<JSX.Element> {
  return <StaffSearchForm condition={await conditionPromise} />;
}
