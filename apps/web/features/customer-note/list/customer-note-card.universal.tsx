import type React from "react";
import { Card, CardContent, CardHeader } from "@workspace/ui/components/card";
import { Calendar, UserPen } from "lucide-react";
import { CustomerNoteAdviceContainer } from "@/features/customer-note/advice/customer-note-advice.server";
import { DeleteCustomerNoteDialog } from "@/features/customer-note/delete/delete-customer-note-dialog.client";
import { EditCustomerNoteDialog } from "@/features/customer-note/edit/edit-customer-note-dialog.client";
import { CustomerNoteImageGallery } from "./customer-note-image-gallery.client";
import type { CustomerNoteWithImages } from "./get-customer-notes";

interface CustomerNoteCardProps {
  note: CustomerNoteWithImages;
  authorName: string;
  canEdit: boolean;
  isAdviceTimeout: boolean;
}

export function CustomerNoteCard({
  note,
  authorName,
  canEdit,
  isAdviceTimeout,
}: CustomerNoteCardProps): React.JSX.Element {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <div className="space-y-1">
          <div className="flex gap-2 text-sm">
            <Calendar className="size-4" />
            {note.serviceDate}
          </div>
          <div className="flex gap-2 text-sm font-medium">
            <UserPen className="size-4" />
            {authorName}
          </div>
        </div>

        {canEdit && (
          <div className="flex gap-2">
            <EditCustomerNoteDialog
              customerId={note.customerId}
              customerNoteId={note.customerNoteId}
              initialContent={note.content}
              initialImages={note.images}
              // 古い state が残ってしまい、編集後に再度ダイアログを開いたときに新しい状態にならないため、
              // updatedAt をキーにして変更があった際にコンポーネントを再マウントさせる
              // updatedAt.getTime() は UNIX タイムスタンプでタイムゾーン非依存のためハイドレーションエラーなし
              initialServiceDate={note.serviceDate}
              key={note.updatedAt.getTime()}
            />
            <DeleteCustomerNoteDialog customerNoteId={note.customerNoteId} />
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-sm whitespace-pre-wrap">{note.content}</p>
        <CustomerNoteImageGallery images={note.images} />
        <CustomerNoteAdviceContainer
          advice={note.advice}
          isTimeout={isAdviceTimeout}
          noteId={note.customerNoteId}
        />
      </CardContent>
    </Card>
  );
}
