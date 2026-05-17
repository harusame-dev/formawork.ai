import { db } from "@workspace/db/client";
import { organizationsTable } from "@workspace/db/schema/organization";
import { organizationCategoriesTable } from "@workspace/db/schema/organization-category";
import { asc, eq } from "drizzle-orm";
import { UserRole } from "@/features/auth/get-user-role";
import { requireRole } from "@/features/auth/require-role";
import { UserRegisterForm } from "./user-form.client";

export async function UserRegisterFormContainer() {
	await requireRole([UserRole.Admin]);
	const organizations = await db
		.select({
			isSystem: organizationCategoriesTable.isSystem,
			name: organizationsTable.name,
			organizationId: organizationsTable.organizationId,
		})
		.from(organizationsTable)
		.innerJoin(
			organizationCategoriesTable,
			eq(organizationsTable.categoryId, organizationCategoriesTable.categoryId),
		)
		.orderBy(asc(organizationsTable.name));

	return <UserRegisterForm organizations={organizations} />;
}
