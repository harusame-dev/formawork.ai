import { db } from "@workspace/db/client";
import { organizationsTable } from "@workspace/db/schema/organization";
import { organizationCategoriesTable } from "@workspace/db/schema/organization-category";
import { asc, eq } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { OrganizationCategoryTag } from "@/features/organization-category/tag";
import { OrganizationTag } from "../tag";

export type OrganizationListItem = {
	categoryId: string;
	categoryName: string;
	organization: {
		email: string;
		name: string;
		organizationId: string;
	} | null;
};

export async function getOrganizations(): Promise<OrganizationListItem[]> {
	"use cache";
	cacheLife("permanent");
	cacheTag(OrganizationTag.List);
	cacheTag(OrganizationCategoryTag.List);

	const rows = await db
		.select({
			categoryId: organizationCategoriesTable.categoryId,
			categoryName: organizationCategoriesTable.name,
			categorySortOrder: organizationCategoriesTable.sortOrder,
			email: organizationsTable.email,
			organizationId: organizationsTable.organizationId,
			organizationName: organizationsTable.name,
		})
		.from(organizationCategoriesTable)
		.leftJoin(
			organizationsTable,
			eq(organizationCategoriesTable.categoryId, organizationsTable.categoryId),
		)
		.where(eq(organizationCategoriesTable.isSystem, false))
		.orderBy(
			asc(organizationCategoriesTable.sortOrder),
			asc(organizationsTable.name),
		);

	return rows.map((row) => ({
		categoryId: row.categoryId,
		categoryName: row.categoryName,
		organization: row.organizationId
			? {
					email: row.email ?? "",
					name: row.organizationName ?? "",
					organizationId: row.organizationId,
				}
			: null,
	}));
}
