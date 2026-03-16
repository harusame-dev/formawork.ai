import { Card } from "@workspace/ui/components/card";
import { Suspense } from "react";
import { CsvImportForm } from "@/features/csv-import/components/csv-import-form.client";

export default function CsvImportPage({
	params,
}: PageProps<"/events/[eventId]/csv-import">) {
	const eventIdPromise = params.then(({ eventId }) => eventId);

	return (
		<div className="container mx-auto space-y-4 p-4">
			<h1 className="font-bold">ボランティア CSV 取り込み</h1>
			<Suspense>
				<CsvImportPageContent eventIdPromise={eventIdPromise} />
			</Suspense>
		</div>
	);
}

async function CsvImportPageContent({
	eventIdPromise,
}: {
	eventIdPromise: Promise<string>;
}) {
	const eventId = await eventIdPromise;

	return (
		<Card className="w-full max-w-xl p-6">
			<CsvImportForm eventId={eventId} />
		</Card>
	);
}
