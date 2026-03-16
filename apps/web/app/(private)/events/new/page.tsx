import { EventForm } from "@/features/event/components/event-form.client";

export default function NewEventPage() {
	return (
		<div className="p-6">
			<h1 className="mb-6 text-2xl font-bold">イベント作成</h1>
			<EventForm mode="create" />
		</div>
	);
}
