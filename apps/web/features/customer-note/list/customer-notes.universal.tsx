import { SearchPagination } from "@workspace/ui/components/search-pagination";
import { CustomerNoteCard } from "./customer-note-card.universal";
import type { CustomerNoteWithImages } from "./get-customer-notes";

interface CustomerNotesPresenterProps {
  notes: (CustomerNoteWithImages & {
    authorName: string;
    canEdit: boolean;
    isAdviceTimeout: boolean;
  })[];
  currentPage: number;
  totalPages: number;
}

export function CustomerNotesPresenter({
  notes,
  currentPage,
  totalPages,
}: CustomerNotesPresenterProps): JSX.Element {
  if (notes.length === 0) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        ノートが見つかりませんでした
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <ul className="space-y-4">
        {notes.map((note) => (
          <li key={note.customerNoteId}>
            <CustomerNoteCard
              authorName={note.authorName}
              canEdit={note.canEdit}
              isAdviceTimeout={note.isAdviceTimeout}
              note={note}
            />
          </li>
        ))}
      </ul>

      <SearchPagination currentPage={currentPage} totalPages={totalPages} />
    </div>
  );
}
