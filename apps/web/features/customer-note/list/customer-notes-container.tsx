import { getUserRole, UserRole } from "@/features/auth/get-user-role";
import { getUserStaffId } from "@/features/auth/get-user-staff-id";
import { CustomerNotesPresenter } from "./customer-notes-presenter";
import {
	type CustomerNoteSearchCondition,
	getCustomerNotes,
} from "./get-customer-notes";

const ADVICE_TIMEOUT_MINUTES = 5;

function isAdviceTimeout(noteUpdatedAt: Date): boolean {
	const now = new Date();
	const diffMs = now.getTime() - noteUpdatedAt.getTime();
	const diffMinutes = diffMs / (1000 * 60);
	return diffMinutes > ADVICE_TIMEOUT_MINUTES;
}

type CustomerNotesContainerProps = {
	customerIdPromise: Promise<string>;
	searchConditionPromise: Promise<{
		dateFrom?: string;
		dateTo?: string;
		keyword?: string;
		page?: number;
	}>;
};

export async function CustomerNotesContainer({
	customerIdPromise,
	searchConditionPromise,
}: CustomerNotesContainerProps) {
	const customerId = await customerIdPromise;
	const searchCondition = await searchConditionPromise;

	// 検索条件を構築
	const condition: CustomerNoteSearchCondition = {
		customerId,
		...searchCondition,
	};

	const [
		{ notes, totalCount, currentPage, totalPages },
		currentUserStaffId,
		currentUserRole,
	] = await Promise.all([
		getCustomerNotes(condition),
		getUserStaffId(),
		getUserRole(),
	]);

	const notesWithPermissions = notes.map((note) => {
		const isOwner = currentUserStaffId === note.staffId;
		const isAdmin = currentUserRole === UserRole.Admin;

		return {
			...note,
			authorName: note.staffName ?? "",
			canEdit: isOwner || isAdmin,
			isAdviceTimeout: !note.advice && isAdviceTimeout(note.updatedAt),
		};
	});

	return (
		<CustomerNotesPresenter
			currentPage={currentPage}
			notes={notesWithPermissions}
			totalCount={totalCount}
			totalPages={totalPages}
		/>
	);
}
