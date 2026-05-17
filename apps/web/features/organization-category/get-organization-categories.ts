import { db } from "@workspace/db/client";
import { organizationCategoriesTable } from "@workspace/db/schema/organization-category";
import { asc, eq } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { OrganizationCategoryTag } from "./tag";

export type OrganizationCategory = {
	categoryId: string;
	name: string;
	sortOrder: number;
	isSystem: boolean;
};

export async function getOrganizationCategories(): Promise<
	OrganizationCategory[]
> {
	"use cache";
	cacheLife("permanent");
	cacheTag(OrganizationCategoryTag.List);

	const categories = await db
		.select({
			categoryId: organizationCategoriesTable.categoryId,
			isSystem: organizationCategoriesTable.isSystem,
			name: organizationCategoriesTable.name,
			sortOrder: organizationCategoriesTable.sortOrder,
		})
		.from(organizationCategoriesTable)
		.where(eq(organizationCategoriesTable.isSystem, false))
		.orderBy(asc(organizationCategoriesTable.sortOrder));

	return categories;
}
