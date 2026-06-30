import type React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table";
import { DeleteGlossaryDialog } from "@/features/glossary/delete/delete-glossary-dialog.client";
import { EditGlossaryDialog } from "@/features/glossary/edit/edit-glossary-dialog.client";

interface GlossaryTableItem {
  id: string;
  note: string;
  sourceTerm: string;
  targetTerm: string;
}

export function GlossaryTable({
  canEdit = true,
  glossaries,
}: {
  canEdit?: boolean;
  glossaries: GlossaryTableItem[];
}): React.JSX.Element {
  if (glossaries.length === 0) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        用語が登録されていません。
        {canEdit && "「用語を追加」から登録してください。"}
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>原語</TableHead>
          <TableHead>訳語</TableHead>
          <TableHead>メモ</TableHead>
          {canEdit && <TableHead className="w-40">操作</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {glossaries.map((glossary) => (
          <TableRow key={glossary.id}>
            <TableCell className="font-medium">{glossary.sourceTerm}</TableCell>
            <TableCell>{glossary.targetTerm}</TableCell>
            <TableCell className="text-muted-foreground">
              {glossary.note || "—"}
            </TableCell>
            {canEdit && (
              <TableCell>
                <div className="flex gap-2">
                  <EditGlossaryDialog
                    glossaryId={glossary.id}
                    note={glossary.note}
                    sourceTerm={glossary.sourceTerm}
                    targetTerm={glossary.targetTerm}
                  />
                  <DeleteGlossaryDialog
                    glossaryId={glossary.id}
                    sourceTerm={glossary.sourceTerm}
                  />
                </div>
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
