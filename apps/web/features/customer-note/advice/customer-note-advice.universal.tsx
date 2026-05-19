import type React from "react";
import type { SelectCustomerNoteAdvice } from "@workspace/db/schema/customer-note-advice";
import {
  CheckCircle2,
  ClipboardList,
  Lightbulb,
  MessageSquare,
  ShieldAlert,
  Sparkles,
  TrendingUp,
} from "lucide-react";

interface Props {
  advice: SelectCustomerNoteAdvice;
}

function AdviceSection({
  children,
  icon: Icon,
  title,
}: {
  children: React.ReactNode;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
}): React.JSX.Element {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <Icon className="size-3.5" />
        <span>{title}</span>
      </div>
      <p className="pl-5 text-sm/relaxed">{children}</p>
    </div>
  );
}

export function CustomerNoteAdvicePresenter({
  advice,
}: Props): React.JSX.Element {
  const { currentEvaluation, nextAdvice } = advice.advice;

  return (
    <div className="space-y-4 rounded-md border border-dashed border-muted-foreground/30 bg-muted/30 p-3">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Sparkles className="size-3.5" />
        <span>AIアドバイス</span>
      </div>

      <div className="space-y-3">
        <h4 className="border-b border-border pb-1 text-xs font-semibold text-foreground/70">
          今回の接客振り返り
        </h4>
        <AdviceSection icon={CheckCircle2} title="良かった点">
          {currentEvaluation.good}
        </AdviceSection>
        <AdviceSection icon={TrendingUp} title="改善ポイント">
          {currentEvaluation.improvement}
        </AdviceSection>
      </div>

      <div className="space-y-3">
        <h4 className="border-b border-border pb-1 text-xs font-semibold text-foreground/70">
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
