import { getLogger } from "@repo/logger/nextjs/server";
import { Resend } from "resend";
import { getResendConfig } from "@/config/resend";

export async function sendConsultationMail({
	chatUuid,
	contactEmail,
	chatUrl,
	targetOrgEmail,
	targetOrgName,
}: {
	chatUuid: string;
	contactEmail: string;
	chatUrl: string;
	targetOrgEmail: string;
	targetOrgName: string;
}): Promise<{ success: true } | { success: false; message: string }> {
	const logger = await getLogger("sendConsultationMail");
	const config = getResendConfig();

	if (!targetOrgEmail) {
		logger.warn("送信先メールアドレスが設定されていません", { chatUuid });
		return { message: "送信先メールアドレスが未設定です", success: false };
	}

	if (!config.apiKey) {
		// API キー未設定時はログだけ残してダミー成功（デモ用）
		logger.info("Resend API キー未設定のためメール送信をスキップ", {
			chatUuid,
			contactEmail,
			targetOrgEmail,
		});
		return { success: true };
	}

	const resend = new Resend(config.apiKey);

	try {
		const { error } = await resend.emails.send({
			from: config.fromAddress,
			subject: `お見送りサポートチャットからのご相談 (${targetOrgName})`,
			text: `お見送りサポートチャットシステムから相談依頼が届きました。

相談者メールアドレス: ${contactEmail}
チャット URL: ${chatUrl}

直接ご連絡の上、対応をお願いいたします。`,
			to: targetOrgEmail,
		});

		if (error) {
			logger.error("メール送信に失敗", { chatUuid, error });
			return { message: "メール送信に失敗しました", success: false };
		}

		return { success: true };
	} catch (error) {
		logger.error("メール送信で例外発生", { chatUuid, err: error });
		return { message: "メール送信に失敗しました", success: false };
	}
}
