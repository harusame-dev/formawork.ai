import type { SelectCustomerNoteAdvice } from "@workspace/db/schema/customer-note-advice";
import { AlertTriangle, Loader2, Sparkles } from "lucide-react";

type Props = {
	advice: SelectCustomerNoteAdvice | null;
	isTimeout?: boolean;
};

export function CustomerNoteAdvice({ advice, isTimeout = false }: Props) {
	if (!advice) {
		if (isTimeout) {
			return (
				<div className="flex items-center gap-2 text-destructive text-sm">
					<AlertTriangle className="size-4" />
					<span>
						アドバイスの生成中にエラーが発生した可能性があります。ノートを編集して保存すると再生成されます。
					</span>
				</div>
			);
		}

		return (
			<div className="flex items-center gap-2 text-muted-foreground text-sm">
				<Loader2 className="size-4 animate-spin" />
				<span>AIアドバイスを生成中です</span>
			</div>
		);
	}

	return (
		<div className="rounded-lg border bg-muted/50 p-3">
			<h4 className="flex items-center gap-1 font-medium text-sm mb-1">
				<Sparkles className="size-4" />
				AIアドバイス
			</h4>
			<p className="text-sm whitespace-pre-wrap">{advice.advice}</p>
		</div>
	);
}
