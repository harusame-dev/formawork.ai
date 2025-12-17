export const CustomerTag = {
	Detail: (customerId: string) => `CUSTOMER_TAG_DETAIL_${customerId}`,
	LatestAdviceByCustomerNoteId: (customerNoteId: string) =>
		`CUSTOMER_TAG_LATEST_ADVICE_BY_CUSTOMER_NOTE_ID_${customerNoteId}`,
	List: "CUSTOMER_TAG_LIST",
	MemoriesByCustomerId: (customerId: string) =>
		`CUSTOMER_TAG_MEMORIES_BY_CUSTOMER_ID_${customerId}`,
	NotesByCustomerId: (customerId: string) =>
		`CUSTOMER_TAG_NOTES_BY_CUSTOMER_ID_${customerId}`,
};
