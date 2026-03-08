import { createAdminClient } from "@repo/supabase/admin";

const BUCKET_NAME = "customer-note-attachments";
// 1.5日 = 129600秒
const SIGNED_URL_EXPIRY_SECONDS = 129600;

/**
 * 複数の顧客ノート画像の閲覧用 signed URL を一括生成する
 * N+1 回避用。呼び出し元のキャッシュに委ねるため、このレイヤーでは "use cache" しない。
 */
export async function getCustomerNoteImageUrls(
	paths: string[],
): Promise<Map<string, string | null>> {
	if (paths.length === 0) return new Map();

	const supabase = createAdminClient();

	const { data, error } = await supabase.storage
		.from(BUCKET_NAME)
		.createSignedUrls(paths, SIGNED_URL_EXPIRY_SECONDS);

	if (error) {
		console.error("Failed to create signed URLs for images", {
			error,
			paths,
		});
		return new Map(paths.map((path) => [path, null]));
	}

	return new Map(
		data.map(({ path, signedUrl }) => [path, signedUrl ?? null]),
	);
}
