// 固定 ID の組織カテゴリーマスタ（13 カテゴリ + システム管理 1 件）
// admin はシステム管理組織に所属する
export const SYSTEM_CATEGORY_ID = "00000000-0000-4000-8000-000000000001";

export const organizationCategoriesFixture = [
	{
		categoryId: SYSTEM_CATEGORY_ID,
		isSystem: true,
		name: "システム管理",
		sortOrder: 0,
	},
	{
		categoryId: "00000000-0000-4000-8000-000000000011",
		isSystem: false,
		name: "省エネルギー",
		sortOrder: 1,
	},
	{
		categoryId: "00000000-0000-4000-8000-000000000012",
		isSystem: false,
		name: "ファイナンシャルプランナー",
		sortOrder: 2,
	},
	{
		categoryId: "00000000-0000-4000-8000-000000000013",
		isSystem: false,
		name: "旅行",
		sortOrder: 3,
	},
	{
		categoryId: "00000000-0000-4000-8000-000000000014",
		isSystem: false,
		name: "介護",
		sortOrder: 4,
	},
	{
		categoryId: "00000000-0000-4000-8000-000000000015",
		isSystem: false,
		name: "葬儀屋",
		sortOrder: 5,
	},
	{
		categoryId: "00000000-0000-4000-8000-000000000016",
		isSystem: false,
		name: "遺産相続・行政書士手続き",
		sortOrder: 6,
	},
	{
		categoryId: "00000000-0000-4000-8000-000000000017",
		isSystem: false,
		name: "家財整理",
		sortOrder: 7,
	},
	{
		categoryId: "00000000-0000-4000-8000-000000000018",
		isSystem: false,
		name: "ごみ処理",
		sortOrder: 8,
	},
	{
		categoryId: "00000000-0000-4000-8000-000000000019",
		isSystem: false,
		name: "リフォーム",
		sortOrder: 9,
	},
	{
		categoryId: "00000000-0000-4000-8000-00000000001a",
		isSystem: false,
		name: "解体",
		sortOrder: 10,
	},
	{
		categoryId: "00000000-0000-4000-8000-00000000001b",
		isSystem: false,
		name: "不動産",
		sortOrder: 11,
	},
	{
		categoryId: "00000000-0000-4000-8000-00000000001c",
		isSystem: false,
		name: "ペット供養",
		sortOrder: 12,
	},
	{
		categoryId: "00000000-0000-4000-8000-00000000001d",
		isSystem: false,
		name: "デジタル遺品整理",
		sortOrder: 13,
	},
];
