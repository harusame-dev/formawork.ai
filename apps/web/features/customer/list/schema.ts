import { succeed } from "@harusame0616/result";
import * as v from "valibot";

export const CUSTOMER_SEARCH_KEYWORD_MAX_LENGTH = 300;

const keywordSchema = v.pipe(
  v.string(),
  v.maxLength(CUSTOMER_SEARCH_KEYWORD_MAX_LENGTH),
);

const pageSchema = v.pipe(v.number(), v.minValue(1));

export const customersConditionSchema = v.object({
  keyword: keywordSchema,
  page: pageSchema,
});

const customersConditionSearchParametersSchema = v.object({
  keyword: v.optional(keywordSchema, ""),
  page: v.optional(v.pipe(v.string(), v.transform(Number), pageSchema), "1"),
});

export type CustomersConditionSearchParams = v.InferOutput<
  typeof customersConditionSearchParametersSchema
>;

export type CustomersCondition = v.InferOutput<typeof customersConditionSchema>;

export function parseCustomersConditionSearchParams(
  value: unknown,
): ReturnType<typeof succeed<CustomersConditionSearchParams>> {
  const result = v.safeParse(customersConditionSearchParametersSchema, value);

  return result.success
    ? succeed(result.output)
    : succeed({ keyword: "", page: 1 });
}

export interface CustomersListItem {
  customerId: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
}
