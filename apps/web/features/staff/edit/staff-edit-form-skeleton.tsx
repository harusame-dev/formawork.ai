import { RequiredBadge } from "@workspace/ui/components/required-badge";
import { Skeleton } from "@workspace/ui/components/skeleton";

export function StaffEditFormSkeleton() {
	return (
		<div aria-busy className="flex flex-col gap-6">
			<span className="sr-only">フォーム読み込み中</span>

			{/* 姓 */}
			<div className="space-y-2">
				<div className="flex items-center gap-2 text-sm font-medium">
					姓
					<RequiredBadge />
				</div>
				<p className="text-[0.8rem] text-muted-foreground">
					24文字以内で入力してください
				</p>
				<Skeleton aria-hidden className="h-9 w-full max-w-xs" />
			</div>

			{/* 名 */}
			<div className="space-y-2">
				<div className="flex items-center gap-2 text-sm font-medium">
					名
					<RequiredBadge />
				</div>
				<p className="text-[0.8rem] text-muted-foreground">
					24文字以内で入力してください
				</p>
				<Skeleton aria-hidden className="h-9 w-full max-w-xs" />
			</div>

			{/* メールアドレス */}
			<div className="space-y-2">
				<div className="flex items-center gap-2 text-sm font-medium">
					メールアドレス
					<RequiredBadge />
				</div>
				<p className="text-[0.8rem] text-muted-foreground">
					ログインに使用するメールアドレスを入力してください
				</p>
				<Skeleton aria-hidden className="h-9 w-full max-w-sm" />
			</div>

			{/* ロール */}
			<div className="space-y-2">
				<div className="flex items-center gap-2 text-sm font-medium">
					ロール
					<RequiredBadge />
				</div>
				<p className="text-[0.8rem] text-muted-foreground">
					一般は顧客一覧・詳細の表示とノートの一覧・編集・削除が可能。管理者は一般に加えて顧客の登録・編集・削除、スタッフの一覧・登録・編集・削除が可能
				</p>
				<div className="flex flex-col gap-2">
					<div className="flex items-center gap-2">
						<Skeleton aria-hidden className="size-4 rounded-full" />
						<span className="text-sm">一般</span>
					</div>
					<div className="flex items-center gap-2">
						<Skeleton aria-hidden className="size-4 rounded-full" />
						<span className="text-sm">管理者</span>
					</div>
				</div>
			</div>

			{/* ボタン */}
			<div className="flex gap-2">
				<Skeleton aria-hidden className="h-9 w-[90px]" />
				<Skeleton aria-hidden className="h-9 w-[120px]" />
			</div>
		</div>
	);
}
