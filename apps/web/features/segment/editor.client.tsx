"use client";

import type React from "react";
import { type SegmentStatus, SegmentStatus as Status } from "@workspace/db/schema/segment";
import { Button } from "@workspace/ui/components/button";
import { Combine, Download, Scissors } from "lucide-react";
import Link from "next/link";
import { useCallback, useMemo, useRef, useState } from "react";
import { splitSentences } from "@/features/work/import/split-into-segments";
import { AssistPanel } from "./assist-panel.client";
import { confirmSegmentAction } from "./confirm-segment.action";
import type { SegmentDto } from "./get-work-segments";
import { mergeSegmentsAction } from "./merge-segments.action";
import { SegmentStatusDot } from "./segment-status-badge.universal";
import { splitSegmentAction } from "./split-segment.action";
import { updateSegmentAction } from "./update-segment.action";

type Mode = "merge" | "normal" | "split";

/** サーバーで永続化済みの状態のスナップショット */
interface Snapshot {
  status: SegmentStatus;
  targetText: string;
}

function buildSnapshotMap(segments: SegmentDto[]): Map<string, Snapshot> {
  const map = new Map<string, Snapshot>();
  for (const segment of segments) {
    map.set(segment.id, {
      status: segment.status,
      targetText: segment.targetText ?? "",
    });
  }
  return map;
}

interface EditorProps {
  canEdit: boolean;
  initialSegments: SegmentDto[];
  projectId: string;
  workId: string;
  workName: string;
}

export function Editor({
  canEdit,
  initialSegments,
  projectId,
  workId,
  workName,
}: EditorProps): React.JSX.Element {
  const [segments, setSegmentsState] = useState<SegmentDto[]>(initialSegments);
  const segmentsRef = useRef<SegmentDto[]>(initialSegments);
  // 各セグメントの「サーバーで永続化済みの状態」のスナップショット。
  // 確定はDBへ反映し、結合・分割はサーバーから新しい配列を受け取って作り直す。
  // レンダー中の参照用に state、イベントハンドラの非同期更新用に ref の二重管理。
  const [snapshotMap, setSnapshotState] = useState<Map<string, Snapshot>>(() =>
    buildSnapshotMap(initialSegments),
  );
  const snapshotRef = useRef<Map<string, Snapshot>>(snapshotMap);
  const [selectedId, setSelectedId] = useState<string | null>(
    initialSegments[0]?.id ?? null,
  );
  const [mode, setMode] = useState<Mode>("normal");
  const [mergeSelected, setMergeSelected] = useState<Set<string>>(new Set());
  const [isConfirming, setIsConfirming] = useState(false);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [structuralError, setStructuralError] = useState<string | null>(null);

  const setSegments = useCallback((next: SegmentDto[]): void => {
    segmentsRef.current = next;
    setSegmentsState(next);
  }, []);

  const setSnapshot = useCallback((next: Map<string, Snapshot>): void => {
    snapshotRef.current = next;
    setSnapshotState(next);
  }, []);

  const selectedSegment = useMemo(
    () => segments.find((segment) => segment.id === selectedId) ?? null,
    [segments, selectedId],
  );

  // 編集中 targetText が永続化済み targetText と異なるか
  const isDirty = useCallback(
    (segment: SegmentDto): boolean => {
      const snapshot = snapshotMap.get(segment.id);
      if (!snapshot) {
        return false;
      }
      return (segment.targetText ?? "") !== snapshot.targetText;
    },
    [snapshotMap],
  );

  // 行頭ドット・ヘッダバッジに使う表示用ステータス。
  // dirty の間は編集中テキストから下書き/未訳を算出し、それ以外は永続化済み status を返す。
  const getDisplayStatus = useCallback(
    (segment: SegmentDto): SegmentStatus => {
      const snapshot = snapshotMap.get(segment.id);
      const working = segment.targetText ?? "";
      if (snapshot && working !== snapshot.targetText) {
        return working.trim().length === 0 ? Status.Untranslated : Status.Draft;
      }
      return snapshot ? snapshot.status : segment.status;
    },
    [snapshotMap],
  );

  const progress = useMemo(() => {
    const total = segments.length;
    const confirmed = segments.filter(
      (segment) =>
        (snapshotMap.get(segment.id)?.status ?? segment.status) ===
        Status.Confirmed,
    ).length;
    return { confirmed, total };
  }, [segments, snapshotMap]);

  function updateLocalTarget(segmentId: string, value: string): void {
    setSegments(
      segmentsRef.current.map((segment) =>
        segment.id === segmentId ? { ...segment, targetText: value } : segment,
      ),
    );
  }

  function handleSelect(segmentId: string): void {
    if (mode === "merge") {
      setMergeSelected((previous) => {
        const next = new Set(previous);
        if (next.has(segmentId)) {
          next.delete(segmentId);
        } else {
          next.add(segmentId);
        }
        return next;
      });
      return;
    }
    setSelectedId(segmentId);
  }

  function handleApply(text: string): void {
    if (!selectedId) {
      return;
    }
    // ローカル更新のみ。dirty として下書き表示になる（DBには保存しない）。
    updateLocalTarget(selectedId, text);
  }

  // 編集中テキストを永続化済みスナップショットの値に戻し dirty を解除する（サーバー呼び出しなし）。
  function handleCancel(): void {
    if (!selectedSegment) {
      return;
    }
    const snapshot = snapshotRef.current.get(selectedSegment.id);
    if (!snapshot) {
      return;
    }
    const segmentId = selectedSegment.id;
    setSegments(
      segmentsRef.current.map((segment) =>
        segment.id === segmentId
          ? { ...segment, targetText: snapshot.targetText }
          : segment,
      ),
    );
  }

  async function handleConfirm(): Promise<void> {
    if (!selectedSegment) {
      return;
    }
    const segmentId = selectedSegment.id;
    const targetText = selectedSegment.targetText ?? "";
    setConfirmError(null);
    setIsConfirming(true);
    // confirm-segment はDB上の targetText を見て空だと失敗するため、確定前にテキストを保存する。
    if (isDirty(selectedSegment)) {
      const updateResult = await updateSegmentAction({
        projectId,
        segmentId,
        targetText,
        workId,
      });
      if (!updateResult.success) {
        setIsConfirming(false);
        setConfirmError(updateResult.error);
        return;
      }
    }
    const result = await confirmSegmentAction({
      projectId,
      segmentId,
      workId,
    });
    setIsConfirming(false);
    if (result.success) {
      const nextSnapshot = new Map(snapshotRef.current);
      nextSnapshot.set(segmentId, {
        status: Status.Confirmed,
        targetText,
      });
      setSnapshot(nextSnapshot);
      setSegments(
        segmentsRef.current.map((segment) =>
          segment.id === segmentId
            ? { ...segment, status: Status.Confirmed }
            : segment,
        ),
      );
    } else {
      setConfirmError(result.error);
    }
  }

  function toggleMode(target: Mode): void {
    setStructuralError(null);
    setMergeSelected(new Set());
    setMode((current) => (current === target ? "normal" : target));
  }

  async function handleMerge(): Promise<void> {
    const ids = segments
      .filter((segment) => mergeSelected.has(segment.id))
      .map((segment) => segment.id);
    if (ids.length < 2) {
      return;
    }
    setStructuralError(null);
    const result = await mergeSegmentsAction({
      projectId,
      segmentIds: ids,
      workId,
    });
    if (result.success) {
      // 構造編集は即時にサーバー反映されるため、スナップショットも作り直し dirty をクリアする。
      setSnapshot(buildSnapshotMap(result.data));
      setSegments(result.data);
      setMergeSelected(new Set());
      setMode("normal");
      setSelectedId(ids[0] ?? null);
    } else {
      setStructuralError(result.error);
    }
  }

  async function handleSplit(
    segmentId: string,
    splitIndex: number,
  ): Promise<void> {
    setStructuralError(null);
    const result = await splitSegmentAction({
      projectId,
      segmentId,
      splitIndex,
      workId,
    });
    if (result.success) {
      // 構造編集は即時にサーバー反映されるため、スナップショットも作り直し dirty をクリアする。
      setSnapshot(buildSnapshotMap(result.data));
      setSegments(result.data);
    } else {
      setStructuralError(result.error);
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-wrap items-center gap-3 border-b bg-card px-4 py-2">
        <Button asChild size="sm" variant="ghost">
          <Link href={`/projects/${projectId}`}>← 戻る</Link>
        </Button>
        <span className="font-semibold">{workName}</span>
        <span className="text-xs text-muted-foreground">
          確定 {progress.confirmed}/{progress.total}
        </span>
        <div className="flex-1" />
        {canEdit && (
          <>
            <Button
              onClick={() => toggleMode("merge")}
              size="sm"
              variant={mode === "merge" ? "default" : "outline"}
            >
              <Combine className="size-4" />
              結合モード
            </Button>
            <Button
              onClick={() => toggleMode("split")}
              size="sm"
              variant={mode === "split" ? "default" : "outline"}
            >
              <Scissors className="size-4" />
              分割モード
            </Button>
          </>
        )}
        <Button disabled size="sm" variant="outline">
          <Download className="size-4" />
          CSV 出力（未実装）
        </Button>
      </div>

      {mode === "merge" && (
        <div className="flex items-center gap-3 border-b bg-amber-50 px-4 py-2 text-sm text-amber-900 dark:bg-amber-950 dark:text-amber-100">
          <span>
            結合したい<b>連続するセグメント</b>をクリックで選択してください
          </span>
          <span className="font-medium">{mergeSelected.size} 文 選択中</span>
          <div className="flex-1" />
          <Button
            disabled={mergeSelected.size < 2}
            onClick={handleMerge}
            size="sm"
          >
            <Combine className="size-4" />
            選択した文を結合
          </Button>
        </div>
      )}
      {mode === "split" && (
        <div className="border-b bg-amber-50 px-4 py-2 text-sm text-amber-900 dark:bg-amber-950 dark:text-amber-100">
          文の区切りに出る <Scissors className="inline size-3.5" /> を
          クリックすると、その位置で 2 文に分割します
        </div>
      )}
      {structuralError && (
        <div
          className="border-b bg-destructive/10 px-4 py-2 text-sm text-destructive"
          role="alert"
        >
          {structuralError}
        </div>
      )}

      <div className="flex min-h-0 flex-1">
        <div className="min-w-0 flex-1 overflow-auto bg-muted/30 p-3">
          <div className="grid grid-cols-[32px_1fr_1fr] gap-2 px-1 pb-2 text-[11px] tracking-wide text-muted-foreground uppercase">
            <div>#</div>
            <div>原文（日本語）</div>
            <div>訳文（英語）</div>
          </div>
          <div className="space-y-1.5">
            {segments.map((segment) => {
              const isSelected = mode === "normal" && segment.id === selectedId;
              const isMergeSelected = mergeSelected.has(segment.id);
              return (
                <div
                  className={`grid grid-cols-[32px_1fr_1fr] overflow-hidden rounded-md border bg-card ${
                    isSelected ? "border-ring ring-2 ring-ring/30" : ""
                  } ${isMergeSelected ? "border-ring bg-accent" : ""}`}
                  key={segment.id}
                  onClick={() => handleSelect(segment.id)}
                >
                  <div className="flex flex-col items-center gap-1 border-r bg-muted/50 pt-2 text-[11px] text-muted-foreground tabular-nums">
                    <SegmentStatusDot status={getDisplayStatus(segment)} />
                    {segment.seq}
                  </div>
                  <div className="border-r px-3 py-2 text-sm/relaxed">
                    {mode === "split" ? (
                      <SplitSource
                        onSplit={(index) => handleSplit(segment.id, index)}
                        text={segment.sourceText}
                      />
                    ) : (
                      segment.sourceText
                    )}
                  </div>
                  <div className="px-2 py-1">
                    <AutoGrowTextarea
                      disabled={!canEdit || mode !== "normal"}
                      onChange={(value) => updateLocalTarget(segment.id, value)}
                      onClick={(event) => event.stopPropagation()}
                      onFocus={() => handleSelect(segment.id)}
                      value={segment.targetText ?? ""}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <aside className="w-[380px] shrink-0 border-l bg-card">
          <AssistPanel
            canEdit={canEdit}
            confirmError={confirmError}
            displayStatus={
              selectedSegment
                ? getDisplayStatus(selectedSegment)
                : Status.Untranslated
            }
            isConfirming={isConfirming}
            isDirty={selectedSegment ? isDirty(selectedSegment) : false}
            key={selectedSegment?.id ?? "none"}
            onApply={handleApply}
            onCancel={handleCancel}
            onConfirm={handleConfirm}
            originalTargetText={
              selectedSegment
                ? (snapshotMap.get(selectedSegment.id)?.targetText ?? "")
                : ""
            }
            projectId={projectId}
            segment={selectedSegment}
          />
        </aside>
      </div>
    </div>
  );
}

/**
 * 入力量に応じて高さが自動で伸びる訳文用 textarea。
 * CSS の field-sizing: content により、ユーザー入力だけでなく
 * アシストパネルからの訳文反映でも内容の高さに追従させる。
 */
function AutoGrowTextarea({
  disabled,
  onChange,
  onClick,
  onFocus,
  value,
}: {
  disabled: boolean;
  onChange: (value: string) => void;
  onClick: (event: React.MouseEvent<HTMLTextAreaElement>) => void;
  onFocus: () => void;
  value: string;
}): React.JSX.Element {
  return (
    <textarea
      className="min-h-9 w-full resize-none overflow-hidden bg-transparent px-1.5 py-1 text-sm/relaxed outline-none field-sizing-content"
      disabled={disabled}
      onChange={(event) => onChange(event.target.value)}
      onClick={onClick}
      onFocus={onFocus}
      rows={1}
      value={value}
    />
  );
}

function SplitSource({
  onSplit,
  text,
}: {
  onSplit: (index: number) => void;
  text: string;
}): React.JSX.Element {
  const parts = splitSentences(text);

  return (
    <span>
      {parts.map((part, index) => (
        // 文の並びは安定しているため index キーで問題ない

        <span key={index}>
          {part}
          {index < parts.length - 1 && (
            <button
              aria-label="ここで分割"
              className="mx-0.5 inline-flex size-4 items-center justify-center rounded-sm border border-amber-300 bg-amber-100 align-middle text-amber-700 hover:bg-amber-500 hover:text-white"
              onClick={(event) => {
                event.stopPropagation();
                onSplit(index);
              }}
              type="button"
            >
              <Scissors className="size-2.5" />
            </button>
          )}
        </span>
      ))}
    </span>
  );
}
