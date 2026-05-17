import { db } from "@workspace/db/client";
import { organizationsTable } from "@workspace/db/schema/organization";
import { organizationCategoriesTable } from "@workspace/db/schema/organization-category";
import { eq } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { OrganizationTag } from "../tag";

export type OrganizationDetail = {
	categoryId: string;
	categoryName: string;
	description: string;
	email: string;
	name: string;
	organizationId: string;
	url: string;
};

export async function getOrganizationDetail(
	organizationId: string,
): Promise<OrganizationDetail | null> {
	"use cache";
	cacheLife("permanent");
	cacheTag(OrganizationTag.Detail(organizationId));

	const result = await db
		.select({
			categoryId: organizationsTable.categoryId,
			categoryName: organizationCategoriesTable.name,
			description: organizationsTable.description,
			email: organizationsTable.email,
			name: organizationsTable.name,
			organizationId: organizationsTable.organizationId,
			url: organizationsTable.url,
		})
		.from(organizationsTable)
		.innerJoin(
			organizationCategoriesTable,
			eq(organizationsTable.categoryId, organizationCategoriesTable.categoryId),
		)
		.where(eq(organizationsTable.organizationId, organizationId))
		.limit(1);

	return result[0] ?? null;
}
