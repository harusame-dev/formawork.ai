export const UserRole = {
	Admin: "admin",
	OrgUser: "org_user",
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];
