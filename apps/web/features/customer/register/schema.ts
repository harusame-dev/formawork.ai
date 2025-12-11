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
} from "../schema";

export const registerCustomerSchema = v.object({
	address: addressSchema,
	birthDate: birthDateSchema,
	email: emailSchema,
	firstName: firstNameSchema,
	firstNameKana: firstNameKanaSchema,
	gender: genderSchema,
	lastName: lastNameSchema,
	lastNameKana: lastNameKanaSchema,
	phone: phoneSchema,
	remarks: remarksSchema,
});

export type RegisterCustomerParams = v.InferOutput<
	typeof registerCustomerSchema
>;
