import * as v from "valibot";
import {
	staffEmailSchema,
	staffFirstNameSchema,
	staffLastNameSchema,
	staffRoleSchema,
} from "../schema";

const editStaffSchema = v.object({
	email: staffEmailSchema,
	firstName: staffFirstNameSchema,
	lastName: staffLastNameSchema,
	role: staffRoleSchema,
});

export type EditStaffParams = v.InferOutput<typeof editStaffSchema>;
