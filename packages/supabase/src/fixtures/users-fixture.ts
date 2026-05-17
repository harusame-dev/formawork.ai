// admin auth user fixture
// app_metadata.role で admin / org_user を判定する
// userId は @workspace/db の users テーブルへの紐付け（app_metadata.userId に格納）
export const adminAuthUser = {
	email: "admin@example.com",
	id: "30000000-0000-4000-8000-000000000001",
	password: "Admin@789!",
	role: "admin",
	userId: "20000000-0000-4000-8000-000000000001",
};

export const usersFixture = [adminAuthUser];
