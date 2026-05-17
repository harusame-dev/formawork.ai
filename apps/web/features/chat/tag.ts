export const ChatTag = {
	Detail: (chatId: string) => `CHAT_TAG_DETAIL_${chatId}`,
	List: "CHAT_TAG_LIST",
	Messages: (chatId: string) => `CHAT_TAG_MESSAGES_${chatId}`,
	OrgRelated: (organizationId: string) => `CHAT_TAG_ORG_${organizationId}`,
	Todos: (chatId: string) => `CHAT_TAG_TODOS_${chatId}`,
};
