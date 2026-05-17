import { SYSTEM_ORGANIZATION_ID } from "./organizations";

// 初期 admin ユーザー（auth.users への作成は別途 seed.ts で実施）
const ADMIN_USER_ID = "20000000-0000-4000-8000-000000000001";
const ADMIN_AUTH_USER_ID = "30000000-0000-4000-8000-000000000001";

export const usersFixture = [
	{
		authUserId: ADMIN_AUTH_USER_ID,
		organizationId: SYSTEM_ORGANIZATION_ID,
		userId: ADMIN_USER_ID,
	},
];
