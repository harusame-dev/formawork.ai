import { Card } from "@workspace/ui/components/card";
import { Suspense } from "react";
import { StaffEditFormContainer } from "@/features/staff/edit/staff-edit-form.server";
import { StaffEditFormSkeleton } from "@/features/staff/edit/staff-edit-form-skeleton.universal";

export default function Page({ params }: PageProps<"/staffs/[staffId]/edit">) {
	const staffIdPromise = params.then(({ staffId }) => staffId);

	return (
		<Card className="w-full p-4">
			<Suspense fallback={<StaffEditFormSkeleton />}>
				<StaffEditFormContainer staffIdPromise={staffIdPromise} />
			</Suspense>
		</Card>
	);
}
