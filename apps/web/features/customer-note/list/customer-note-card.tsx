import { Card, CardContent, CardHeader } from "@workspace/ui/components/card";
import { Calendar, CalendarClock, UserPen } from "lucide-react";
import { DateTime } from "@/components/date-time";
import { CustomerNoteAdviceContainer } from "@/features/customer-note/advice/customer-note-advice-container";
import { DeleteCustomerNoteDialog } from "@/features/customer-note/delete/delete-customer-note-dialog";
import { EditCustomerNoteDialog } from "@/features/customer-note/edit/edit-customer-note-dialog";
import { CustomerNoteImageGallery } from "./customer-note-image-gallery";
import type { CustomerNoteWithImages } from "./get-customer-notes";

type CustomerNoteCardProps = {
	note: CustomerNoteWithImages;
	authorName: string;
	canEdit: boolean;
	isAdviceTimeout: boolean;
};

export function CustomerNoteCard({
	note,
	authorName,
	canEdit,
	isAdviceTimeout,
}: CustomerNoteCardProps) {
	return (
		<Card>
			<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
				<div className="space-y-1">
					<div className="text-sm flex gap-2">
						<Calendar className="size-4" />
						接客日: {note.serviceDate}
					</div>
					<div className="text-sm text-muted-foreground flex gap-2">
						<CalendarClock className="size-4" />
						<DateTime date={new Date(note.createdAt)} />
					</div>
					<div className="text-sm font-medium flex gap-2">
						<UserPen className="size-4" />
						{authorName}
					</div>
				</div>

				{canEdit && (
					<div className="flex gap-2">
						<EditCustomerNoteDialog
							customerId={note.customerId}
							initialContent={note.content}
							initialImages={note.images}
							initialServiceDate={note.serviceDate}
							// 古い state が残ってしまい、編集後に再度ダイアログを開いたときに新しい状態にならないため、
							// updatedAt をキーにして変更があった際にコンポーネントを再マウントさせる
							// updatedAt.getTime() は UNIX タイムスタンプでタイムゾーン非依存のためハイドレーションエラーなし
							key={note.updatedAt.getTime()}
							noteId={note.customerNoteId}
						/>
						<DeleteCustomerNoteDialog noteId={note.customerNoteId} />
					</div>
				)}
			</CardHeader>

			<CardContent className="space-y-4">
				<p className="whitespace-pre-wrap text-sm">{note.content}</p>
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
