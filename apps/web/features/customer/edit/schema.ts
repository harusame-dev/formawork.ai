import * as v from "valibot";
import {
  addressSchema,
  birthDateSchema,
  emailSchema,
  firstNameKanaSchema,
  firstNameSchema,
  genderSchema,
  lastNameKanaSchema,
  lastNameSchema,
  phoneSchema,
  remarksSchema,
} from "@/features/customer/schema";

export const editCustomerSchema = v.object({
  address: addressSchema,
  birthDate: birthDateSchema,
  customerId: v.pipe(v.string(), v.uuid()),
  email: emailSchema,
  firstName: firstNameSchema,
  firstNameKana: firstNameKanaSchema,
  gender: genderSchema,
  lastName: lastNameSchema,
  lastNameKana: lastNameKanaSchema,
  phone: phoneSchema,
  remarks: remarksSchema,
});

export type EditCustomerParams = v.InferInput<typeof editCustomerSchema>;
