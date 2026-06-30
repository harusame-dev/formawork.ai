import type React from "react";
import Link from "next/link";
import type { WorkListItem } from "./get-works";

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
    <ul className="divide-y">
      {works.map((work) => (
        <li key={work.id}>
          <Link
            className="flex items-center justify-between gap-3 rounded-md px-2 py-3 transition-colors hover:bg-muted"
            href={`/projects/${projectId}/works/${work.id}`}
          >
            <span className="font-medium">{work.name}</span>
            <span className="text-xs whitespace-nowrap text-muted-foreground">
              {work.confirmedCount} / {work.totalCount}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
