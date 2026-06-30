import type React from "react";
import {
  SEGMENT_STATUS_LABEL,
  type SegmentStatus,
  SegmentStatus as Status,
} from "@workspace/db/schema/segment";
import { Badge } from "@workspace/ui/components/badge";

const DOT_COLOR: Record<SegmentStatus, string> = {
  [Status.Untranslated]: "bg-muted-foreground",
  [Status.Draft]: "bg-amber-500",
  [Status.Confirmed]: "bg-green-600",
};

export function SegmentStatusDot({
  status,
}: {
  status: SegmentStatus;
}): React.JSX.Element {
  return (
    <span
      className={`inline-block size-2 rounded-full ${DOT_COLOR[status]}`}
      title={SEGMENT_STATUS_LABEL[status]}
    />
  );
}

export function SegmentStatusBadge({
  status,
}: {
  status: SegmentStatus;
}): React.JSX.Element {
  return (
    <Badge className="gap-1.5" variant="outline">
      <span className={`size-1.5 rounded-full ${DOT_COLOR[status]}`} />
      {SEGMENT_STATUS_LABEL[status]}
    </Badge>
  );
}
