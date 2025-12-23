import { Skeleton } from "@workspace/ui/components/skeleton";

export function CustomerSearchFormSkeleton() {
	return (
		<div aria-busy="true">
			<div className="sr-only">読み込み中</div>
			<div className="space-y-2">
				{/* FormLabel */}
				<div className="text-sm font-bold leading-none">キーワード</div>

				{/* FormDescription */}
				<p className="text-sm text-muted-foreground">
					姓名、セイメイ、電話番号、メールアドレスを前方一致で検索（最大300文字）
				</p>

				{/* Input + Button */}
				<div className="flex gap-4 items-center">
					<Skeleton className="h-9 w-full rounded-md" />
					<Skeleton className="h-9 w-[76px] rounded-md" />
				</div>
			</div>
		</div>
	);
}
