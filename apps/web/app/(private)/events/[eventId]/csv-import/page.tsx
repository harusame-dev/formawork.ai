import { Card } from "@workspace/ui/components/card";
import { Suspense } from "react";
import { CsvImportForm } from "@/features/csv-import/components/csv-import-form.client";

export default function CsvImportPage({
	params,
}: PageProps<"/events/[eventId]/csv-import">) {
	const eventIdPromise = params.then(({ eventId }) => eventId);

	return (
		<div className="flex flex-col">
			<div className="px-6 py-4">
				<h2 className="text-xl font-bold">CSV取り込み</h2>
			</div>
			<div className="px-6 pb-6">
				<Suspense>
					<CsvImportPageContent eventIdPromise={eventIdPromise} />
				</Suspense>
			</div>
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
