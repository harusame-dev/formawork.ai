import { Card } from "@workspace/ui/components/card";
import { Suspense } from "react";
import { AllTasksContainer } from "@/features/task/list/all-tasks.server";

export default function Page() {
	return (
		<div className="container mx-auto p-2 space-y-4">
			<div className="flex items-center justify-between">
				<h1 className="font-bold">タスク一覧</h1>
			</div>
			<Card className="py-2 w-full">
				<Suspense fallback={<div className="sr-only">読み込み中</div>}>
					<AllTasksContainer />
				</Suspense>
			</Card>
		</div>
	);
}
