type ProjectStatusBarProps = {
	done: number;
	inProgress: number;
	todo: number;
	total: number;
};

export function ProjectStatusBar({
	done,
	inProgress,
	todo,
	total,
}: ProjectStatusBarProps) {
	const todoPercent = Math.round((todo / total) * 100);
	const inProgressPercent = Math.round((inProgress / total) * 100);
	const donePercent = 100 - todoPercent - inProgressPercent;

	return (
		<div className="space-y-2">
			<p className="text-sm text-muted-foreground">タスク進捗</p>
			<div className="flex h-4 w-full overflow-hidden rounded-full">
				{todoPercent > 0 && (
					<div
						className="bg-muted-foreground/30"
						style={{ width: `${todoPercent}%` }}
						title={`未着手: ${todo}件`}
					/>
				)}
				{inProgressPercent > 0 && (
					<div
						className="bg-blue-400"
						style={{ width: `${inProgressPercent}%` }}
						title={`進行中: ${inProgress}件`}
					/>
				)}
				{donePercent > 0 && (
					<div
						className="bg-green-500"
						style={{ width: `${donePercent}%` }}
						title={`完了: ${done}件`}
					/>
				)}
			</div>
			<div className="flex gap-4 text-xs text-muted-foreground">
				<span className="flex items-center gap-1">
					<span className="inline-block h-2 w-2 rounded-full bg-muted-foreground/30" />
					未着手 {todo}件
				</span>
				<span className="flex items-center gap-1">
					<span className="inline-block h-2 w-2 rounded-full bg-blue-400" />
					進行中 {inProgress}件
				</span>
				<span className="flex items-center gap-1">
					<span className="inline-block h-2 w-2 rounded-full bg-green-500" />
					完了 {done}件
				</span>
			</div>
		</div>
	);
}
