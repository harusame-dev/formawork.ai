import type React from "react";
import { Button } from "@workspace/ui/components/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table";
import Link from "next/link";
import { WorkStatusBadge } from "@/features/work/work-status-badge.universal";
import type { WorkListItem } from "./get-works";

function ProgressBar({
  confirmed,
  total,
}: {
  confirmed: number;
  total: number;
}): React.JSX.Element {
  const percent = total === 0 ? 0 : Math.round((confirmed / total) * 100);

  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-green-600"
          style={{ width: `${percent}%` }}
        />
      </div>
      <span className="text-xs whitespace-nowrap text-muted-foreground">
        {confirmed}/{total}
      </span>
    </div>
  );
}

export function WorksPresenter({
  projectId,
  works,
}: {
  projectId: string;
  works: WorkListItem[];
}): React.JSX.Element {
  if (works.length === 0) {
    return (
      <div className="py-8 text-center text-sm text-muted-foreground">
        ワークがありません。ドキュメント（.docx）をアップロードしてください。
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>ドキュメント</TableHead>
          <TableHead>ステータス</TableHead>
          <TableHead className="w-56">セグメント進捗</TableHead>
          <TableHead className="w-20" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {works.map((work) => (
          <TableRow key={work.id}>
            <TableCell>
              <div className="font-medium">{work.name}</div>
              <div className="text-xs text-muted-foreground">
                {work.totalCount} セグメント
              </div>
            </TableCell>
            <TableCell>
              <WorkStatusBadge status={work.status} />
            </TableCell>
            <TableCell>
              <ProgressBar
                confirmed={work.confirmedCount}
                total={work.totalCount}
              />
            </TableCell>
            <TableCell>
              <Button asChild size="sm">
                <Link href={`/projects/${projectId}/works/${work.id}`}>
                  開く
                </Link>
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
