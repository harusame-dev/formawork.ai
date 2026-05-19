import type React from "react";
import * as v from "valibot";
import { CustomerNotesContainer } from "@/features/customer-note/list/customer-notes.server";
import { CustomerNotesSearchForm } from "@/features/customer-note/list/customer-notes-search-form.client";
import { CustomerNotesSearchFormSkeleton } from "@/features/customer-note/list/customer-notes-search-form-skeleton.universal";
import { CustomerNotesSkeleton } from "@/features/customer-note/list/customer-notes-skeleton.universal";
import { SuspenseOnSearch } from "@/libs/suspense-on-search.client";

const searchParametersSchema = v.object({
  dateFrom: v.optional(v.string()),
  dateTo: v.optional(v.string()),
  keyword: v.optional(v.string()),
  page: v.optional(v.pipe(v.string(), v.transform(Number)), "1"),
});

export default async function CustomerNotesPage({
  params,
  searchParams,
}: PageProps<"/customers/[customerId]/notes">): Promise<React.JSX.Element> {
  const customerIdPromise = params.then(({ customerId }) => customerId);
  const searchConditionPromise = searchParams.then((sp) =>
    v.parse(searchParametersSchema, sp),
  );

  return (
    <div className="space-y-4">
      <SuspenseOnSearch fallback={<CustomerNotesSearchFormSkeleton />}>
        <CustomerNotesSearchForm condition={searchConditionPromise} />
      </SuspenseOnSearch>

      <SuspenseOnSearch fallback={<CustomerNotesSkeleton />}>
        <CustomerNotesContainer
          customerIdPromise={customerIdPromise}
          searchConditionPromise={searchConditionPromise}
        />
      </SuspenseOnSearch>
    </div>
  );
}
