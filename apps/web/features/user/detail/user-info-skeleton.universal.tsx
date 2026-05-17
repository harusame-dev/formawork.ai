import { Card, CardContent, CardHeader } from "@workspace/ui/components/card";
import { Skeleton } from "@workspace/ui/components/skeleton";

export function UserInfoSkeleton() {
	return (
		<Card>
			<CardHeader>
				<Skeleton className="h-6 w-64" />
			</CardHeader>
			<CardContent className="flex flex-col gap-2">
				<Skeleton className="h-4 w-40" />
				<Skeleton className="h-4 w-32" />
			</CardContent>
		</Card>
	);
}
