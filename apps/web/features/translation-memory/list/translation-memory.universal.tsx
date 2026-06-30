import type React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table";
import type { TranslationMemoryItem } from "./get-translation-memories";

export function TranslationMemoryPresenter({
  items,
}: {
  items: TranslationMemoryItem[];
}): React.JSX.Element {
  if (items.length === 0) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        確定した対訳がまだありません
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>原文（和）</TableHead>
          <TableHead>訳文（英）</TableHead>
          <TableHead>プロジェクト</TableHead>
          <TableHead>登録日</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item) => (
          <TableRow key={item.id}>
            <TableCell className="max-w-xs wrap-break-word">
              {item.sourceText}
            </TableCell>
            <TableCell className="max-w-xs wrap-break-word">
              {item.targetText}
            </TableCell>
            <TableCell>{item.projectName}</TableCell>
            <TableCell>{item.createdAt.toLocaleDateString("ja-JP")}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
