import type React from "react";
import {
  WORK_STATUS_LABEL,
  type WorkStatus,
  WorkStatus as Status,
} from "@workspace/db/schema/work";
import { Badge } from "@workspace/ui/components/badge";

const DOT_COLOR: Record<WorkStatus, string> = {
  [Status.NotStarted]: "bg-muted-foreground",
  [Status.InProgress]: "bg-amber-500",
  [Status.Completed]: "bg-green-600",
};

export function WorkStatusBadge({
  status,
}: {
  status: WorkStatus;
}): React.JSX.Element {
  return (
    <Badge className="gap-1.5" variant="outline">
      <span className={`size-1.5 rounded-full ${DOT_COLOR[status]}`} />
      {WORK_STATUS_LABEL[status]}
    </Badge>
  );
}
