"use client";

import type React from "react";
import { SegmentStatus } from "@workspace/db/schema/segment";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Loader2, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { getSegmentAssistAction } from "./get-segment-assist.action";
import type { SegmentDto } from "./get-work-segments";
import { SegmentStatusBadge } from "./segment-status-badge.universal";
import type { SegmentAssist } from "./assist-types";
import { translateSegmentAction } from "./translate-segment.action";

interface AssistPanelProps {
  canEdit: boolean;
  confirmError: string | null;
  displayStatus: SegmentStatus;
  isConfirming: boolean;
  isDirty: boolean;
  onApply: (text: string) => void;
  onCancel: () => void;
  onConfirm: () => void;
  originalTargetText: string;
  projectId: string;
  segment: SegmentDto | null;
}

export function AssistPanel({
  canEdit,
  confirmError,
  displayStatus,
  isConfirming,
  isDirty,
  onApply,
  onCancel,
  onConfirm,
  originalTargetText,
  projectId,
  segment,
}: AssistPanelProps): React.JSX.Element {
  // このコンポーネントはエディタ側で segment.id を key にして再マウントされるため、
  // セグメント切り替え時に state はリセットされる（effect 内での同期 setState を避ける）。
  const segmentId = segment?.id ?? null;
  const [candidate, setCandidate] = useState<string | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [translateError, setTranslateError] = useState<string | null>(null);
  const [assist, setAssist] = useState<SegmentAssist | null>(null);
  const [isLoadingAssist, setIsLoadingAssist] = useState(segmentId !== null);

  useEffect(() => {
    if (!segmentId) {
      return;
    }

    let active = true;
    getSegmentAssistAction({ projectId, segmentId })
      .then((result) => {
        if (!active) {
          return;
        }
        setIsLoadingAssist(false);
        if (result.success) {
          setAssist(result.data);
        }
      })
      .catch(() => {});

    return (): void => {
      active = false;
    };
  }, [segmentId, projectId]);

  function handleTranslate(): void {
    if (!segmentId) {
      return;
    }
    setTranslateError(null);
    setIsTranslating(true);
    translateSegmentAction({ projectId, segmentId })
      .then((result) => {
        setIsTranslating(false);
        if (result.success) {
          setCandidate(result.data.translation);
        } else {
          setTranslateError(result.error);
        }
      })
      .catch(() => {
        setIsTranslating(false);
        setTranslateError("AI 英訳の生成に失敗しました");
      });
  }

  if (!segment) {
    return (
      <div className="flex h-full items-center justify-center p-8 text-center text-sm text-muted-foreground">
        セグメントを選択すると、AI 英訳候補・翻訳メモリ・用語集が表示されます
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col overflow-auto">
      <div className="sticky top-0 z-10 flex items-center justify-between gap-2 border-b bg-card p-3">
        <div className="flex items-center gap-2">
          <SegmentStatusBadge status={displayStatus} />
          <span className="text-xs text-muted-foreground">
            セグメント #{segment.seq}
          </span>
        </div>
        {canEdit && (
          <div className="flex items-center gap-1.5">
            <Button
              disabled={!isDirty}
              onClick={onCancel}
              size="sm"
              variant="ghost"
            >
              キャンセル
            </Button>
            <Button
              disabled={isConfirming || displayStatus !== SegmentStatus.Draft}
              isProcessing={isConfirming}
              onClick={onConfirm}
              processingLabel="確定中"
              size="sm"
            >
              確定
            </Button>
          </div>
        )}
      </div>

      <div className="space-y-4 p-3">
        <div className="rounded-md bg-muted p-2 text-xs text-foreground">
          {segment.sourceText}
        </div>

        {isDirty && originalTargetText.trim().length > 0 && (
          <section className="space-y-1.5">
            <h4 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              元の訳文
            </h4>
            <div className="rounded-md border bg-muted/50 p-2.5 text-sm whitespace-pre-wrap text-muted-foreground">
              {originalTargetText}
            </div>
          </section>
        )}

        {confirmError && (
          <div className="text-sm text-destructive" role="alert">
            {confirmError}
          </div>
        )}

        {canEdit && (
          <section className="space-y-2">
            <h4 className="flex items-center gap-1.5 text-xs font-medium tracking-wide text-muted-foreground uppercase">
              <Sparkles className="size-3.5" />
              AI 英訳候補
            </h4>
            {candidate ? (
              <div className="rounded-md border border-blue-200 bg-blue-50 p-2.5 text-sm text-blue-900 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-100">
                {candidate}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">
                「AI 生成」で原文を英訳します。翻訳メモリ・用語集を
                ヒントとして渡します。
              </p>
            )}
            <div className="flex gap-2">
              {candidate && (
                <Button
                  className="flex-1"
                  onClick={() => onApply(candidate)}
                  size="sm"
                >
                  訳文に挿入
                </Button>
              )}
              <Button
                disabled={isTranslating}
                isProcessing={isTranslating}
                onClick={handleTranslate}
                processingLabel="生成中"
                size="sm"
                variant="outline"
              >
                <Sparkles className="size-4" />
                {candidate ? "再生成" : "AI 生成"}
              </Button>
            </div>
            {translateError && (
              <div className="text-sm text-destructive" role="alert">
                {translateError}
              </div>
            )}
          </section>
        )}

        <section className="space-y-2">
          <h4 className="flex items-center gap-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
            翻訳メモリ
          </h4>
          {isLoadingAssist ? (
            <Loader2 className="size-4 animate-spin text-muted-foreground" />
          ) : assist && assist.tmMatches.length > 0 ? (
            <ul className="space-y-2">
              {assist.tmMatches.map((tm) => (
                <li key={tm.id}>
                  <button
                    className="w-full rounded-md border p-2 text-left hover:bg-muted"
                    onClick={() => canEdit && onApply(tm.targetText)}
                    type="button"
                  >
                    <div className="text-xs text-muted-foreground">
                      {tm.sourceText}
                    </div>
                    <div className="mt-0.5 text-xs">{tm.targetText}</div>
                    <div className="mt-1 flex items-center justify-between">
                      <span className="text-[11px] text-muted-foreground">
                        {tm.projectName}
                      </span>
                      <span className="text-[11px] font-medium text-green-600">
                        類似度 {Math.round(tm.score * 100)}%
                      </span>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-muted-foreground">
              翻訳メモリはありません
            </p>
          )}
        </section>

        <section className="space-y-2">
          <h4 className="flex items-center gap-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
            用語集マッチ
          </h4>
          {assist && assist.glossaryMatches.length > 0 ? (
            <ul className="space-y-1">
              {assist.glossaryMatches.map((glossary) => (
                <li
                  className="flex items-center gap-2 border-b border-dashed py-1 text-xs last:border-b-0"
                  key={`${glossary.sourceTerm}-${glossary.targetTerm}`}
                >
                  <span className="text-muted-foreground">
                    {glossary.sourceTerm}
                  </span>
                  <span className="text-muted-foreground/50">→</span>
                  <span className="font-medium">{glossary.targetTerm}</span>
                  {glossary.isCommon && (
                    <Badge className="ml-auto" variant="outline">
                      共通
                    </Badge>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-muted-foreground">
              一致する用語はありません
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
