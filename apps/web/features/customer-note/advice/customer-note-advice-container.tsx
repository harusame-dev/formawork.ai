import type { SelectCustomerNoteAdvice } from "@workspace/db/schema/customer-note-advice";
import { CustomerNoteAdviceLoading } from "./customer-note-advice-loading";
import { CustomerNoteAdvicePresenter } from "./customer-note-advice-presenter";

type Props = {
	advice: SelectCustomerNoteAdvice | null;
	noteId: string;
	isTimeout: boolean;
};

export function CustomerNoteAdviceContainer({
	advice,
	noteId,
	isTimeout,
}: Props) {
	if (advice) {
		return <CustomerNoteAdvicePresenter advice={advice} />;
	}

	return <CustomerNoteAdviceLoading isTimeout={isTimeout} noteId={noteId} />;
}
