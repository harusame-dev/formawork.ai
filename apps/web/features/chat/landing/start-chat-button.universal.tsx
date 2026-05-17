import { Skeleton } from "@workspace/ui/components/skeleton";

export function StartChatButtonSkeleton() {
	return (
		<div className="flex w-full flex-col items-center gap-3">
			<Skeleton className="h-[56px] w-full max-w-xs bg-[#2A2622]/15" />
		</div>
	);
}
