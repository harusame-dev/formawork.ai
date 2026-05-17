import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@workspace/ui/components/card";
import { Sparkles } from "lucide-react";

export function DashboardPresenter() {
	return (
		<div className="container mx-auto p-4 space-y-4">
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Sparkles className="h-5 w-5" />
						お見送りサポートチャット管理画面
					</CardTitle>
				</CardHeader>
				<CardContent className="text-muted-foreground">
					<p>
						左上のメニューから、組織管理・ユーザー管理・チャット履歴にアクセスできます。
					</p>
				</CardContent>
			</Card>
		</div>
	);
}
