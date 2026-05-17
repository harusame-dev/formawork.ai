import { db } from "./client.js";
import { organizationCategoriesFixture } from "./fixtures/organization-categories.js";
import { organizationsFixture } from "./fixtures/organizations.js";
import { usersFixture } from "./fixtures/users.js";
import { organizationsTable } from "./schema/organization.js";
import { organizationCategoriesTable } from "./schema/organization-category.js";
import { usersTable } from "./schema/user.js";

async function seed() {
	console.log("⭐️ シーディング開始");

	// 組織カテゴリーマスタ（11 + システム管理 1 件）
	await db
		.insert(organizationCategoriesTable)
		.values(organizationCategoriesFixture)
		.onConflictDoNothing();
	console.log(
		`💾 組織カテゴリー追加： ${organizationCategoriesFixture.length} 件`,
	);

	// システム管理組織
	await db
		.insert(organizationsTable)
		.values(organizationsFixture)
		.onConflictDoNothing();
	console.log(`💾 組織追加： ${organizationsFixture.length} 件`);

	// admin ユーザー
	await db.insert(usersTable).values(usersFixture).onConflictDoNothing();
	console.log(`💾 ユーザー追加： ${usersFixture.length} 件`);
}

seed()
	.then(() => {
		console.log("✅️ シーディング完了");
		process.exit(0);
	})
	.catch((error) => {
		console.error("❌️ シーディング失敗", error);
		process.exit(1);
	});
