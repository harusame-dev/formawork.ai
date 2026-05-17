import { db } from "@workspace/db/client";
import { organizationsTable } from "@workspace/db/schema/organization";
import { organizationCategoriesTable } from "@workspace/db/schema/organization-category";
import { asc, eq } from "drizzle-orm";

type ChatOrganizationByCategory = {
	categoryId: string;
	description: string;
	email: string;
	name: string;
	organizationId: string;
	url: string;
};

// チャットで「相談する」ボタンの送信先候補となる組織を、カテゴリ毎に取得する
// MVP は 1 カテゴリ = 1 組織想定
export async function getOrganizationsByCategory(): Promise<
	ChatOrganizationByCategory[]
> {
	return db
		.select({
			categoryId: organizationsTable.categoryId,
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
		.where(eq(organizationCategoriesTable.isSystem, false))
		.orderBy(asc(organizationCategoriesTable.sortOrder));
}
