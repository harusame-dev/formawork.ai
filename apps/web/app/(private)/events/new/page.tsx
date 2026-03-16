import { EventForm } from "@/features/event/components/event-form.client";

export default function NewEventPage() {
	return (
		<div className="flex flex-col">
			<div className="px-6 py-4">
				<h1 className="text-xl font-bold">イベント作成</h1>
			</div>
			<div className="px-6 pb-6">
				<EventForm mode="create" />
			</div>
		</div>
	);
}
