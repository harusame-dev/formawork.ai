import { createAdminClient } from "@repo/supabase/admin";
import { cacheLife } from "next/cache";

const BUCKET_NAME = "customer-note-attachments";
// 1.5日 = 129600秒
const SIGNED_URL_EXPIRY_SECONDS = 129600;

/**
 * 複数の顧客ノート画像の閲覧用 signed URL を一括生成する
 * キャッシュ時間: 1日
 * signed URL 有効期限: 1.5日
 * @returns Map<path, signedUrl | null>
 */
export async function getCustomerNoteImageUrls(
	paths: string[],
): Promise<Map<string, string | null>> {
	"use cache";
	cacheLife("days");

	if (paths.length === 0) {
		return new Map();
	}

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
		data.map((item) => [item.path, item.signedUrl ?? null]),
	);
}
