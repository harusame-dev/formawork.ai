import { Card } from "@workspace/ui/components/card";
import { Suspense } from "react";
import { StaffEditFormContainer } from "@/features/staff/edit/staff-edit-form-container";
import { StaffEditFormSkeleton } from "@/features/staff/edit/staff-edit-form-skeleton";

export default function Page({ params }: PageProps<"/staffs/[staffId]/edit">) {
	const staffIdPromise = params.then(({ staffId }) => staffId);

	return (
		<div className="container mx-auto space-y-4 p-2">
			<h1 className="font-bold">スタッフ情報の編集</h1>
			<Card className="w-full p-4">
				<Suspense fallback={<StaffEditFormSkeleton />}>
					<StaffEditFormContainer staffIdPromise={staffIdPromise} />
				</Suspense>
			</Card>
		</div>
	);
}
