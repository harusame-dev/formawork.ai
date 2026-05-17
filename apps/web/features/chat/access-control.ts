// 公開アクセス側で UUID チャットの有効期限を判定する
// 最終アクセスから 1 週間（7 日）を超過したらアクセスを遮断する

const CHAT_PUBLIC_ACCESS_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export function isChatPublicAccessExpired(lastAccessedAt: Date): boolean {
	return Date.now() - lastAccessedAt.getTime() > CHAT_PUBLIC_ACCESS_TTL_MS;
}
