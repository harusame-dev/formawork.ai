export const CustomerTag = {
	// TODO: パスカルケースに修正
	crud: "CUSTOMER_TAG_CRUD",
	MemoryCrud: (customerId: string) => `CUSTOMER_TAG_MEMORY_CRUD_${customerId}`,
	NoteCrud: (customerId: string) => `CUSTOMER_TAG_NOTE_CRUD_${customerId}`,
};

// @knip-ignore - Used in get-customer-detail.ts (not in this PR)
export function tagByCustomerId(customerId: string) {
	return `CUSTOMER_TAG_${customerId}`;
}
