import type { SelectCustomerNoteAdvice } from "@workspace/db/schema/customer-note-advice";
import {
	AlertTriangle,
	CheckCircle2,
	ClipboardList,
	Lightbulb,
	Loader2,
	MessageSquare,
	ShieldAlert,
	Sparkles,
	TrendingUp,
} from "lucide-react";

type Props = {
	advice: SelectCustomerNoteAdvice | null;
	isTimeout?: boolean;
};

function AdviceSection({
	children,
	icon: Icon,
	title,
}: {
	children: React.ReactNode;
	icon: React.ComponentType<{ className?: string }>;
	title: string;
}) {
	return (
		<div className="space-y-1">
			<div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
				<Icon className="size-3.5" />
				<span>{title}</span>
			</div>
			<p className="text-sm leading-relaxed pl-5">{children}</p>
		</div>
	);
}

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

	const { currentEvaluation, nextAdvice } = advice.advice;

	return (
		<div className="rounded-md border border-dashed border-muted-foreground/30 bg-muted/30 p-3 space-y-4">
			<div className="flex items-center gap-1.5 text-xs text-muted-foreground">
				<Sparkles className="size-3.5" />
				<span>AIアドバイス</span>
			</div>

			{/* 今回の接客評価 */}
			<div className="space-y-3">
				<h4 className="text-xs font-semibold text-foreground/70 border-b border-border pb-1">
					今回の接客振り返り
				</h4>
				<AdviceSection icon={CheckCircle2} title="良かった点">
					{currentEvaluation.good}
				</AdviceSection>
				<AdviceSection icon={TrendingUp} title="改善ポイント">
					{currentEvaluation.improvement}
				</AdviceSection>
			</div>

			{/* 次回の接客アドバイス */}
			<div className="space-y-3">
				<h4 className="text-xs font-semibold text-foreground/70 border-b border-border pb-1">
					次回の接客アドバイス
				</h4>
				<AdviceSection icon={MessageSquare} title="冒頭で触れるべきこと">
					{nextAdvice.openingTopics}
				</AdviceSection>
				<AdviceSection icon={ClipboardList} title="確認・フォローすべきこと">
					{nextAdvice.followUpItems}
				</AdviceSection>
				<AdviceSection icon={Lightbulb} title="提案の機会">
					{nextAdvice.salesOpportunities}
				</AdviceSection>
				<AdviceSection icon={ShieldAlert} title="注意点・避けるべきこと">
					{nextAdvice.caution}
				</AdviceSection>
				<AdviceSection
					icon={ClipboardList}
					title="次回に向けて確認しておくこと"
				>
					{nextAdvice.nextActions}
				</AdviceSection>
			</div>
		</div>
	);
}
