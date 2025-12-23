import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@workspace/ui/components/card";
import { AlertTriangle, Sparkles } from "lucide-react";

export default function Page() {
	return (
		<div className="container mx-auto p-4 space-y-4">
			<Card id="onboarding-welcome">
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Sparkles className="h-5 w-5" />
						FORMAWORK.AI CRM へようこそ
					</CardTitle>
				</CardHeader>
				<CardContent>
					<p className="text-muted-foreground">
						顧客管理を効率的に行うための CRM システムです。
						左上のメニューから各機能にアクセスできます。
					</p>
				</CardContent>
			</Card>

			<Card className="border-amber-200 bg-amber-50" id="onboarding-caution">
				<CardHeader>
					<CardTitle className="flex items-center gap-2 text-amber-800">
						<AlertTriangle className="h-5 w-5" />
						ご注意ください
					</CardTitle>
				</CardHeader>
				<CardContent>
					<p className="text-amber-700">
						このデモ環境は誰でも閲覧可能です。機密情報や実際の個人情報は登録しないでください。
						また、データは予告なくリセットされる場合があります。
					</p>
				</CardContent>
			</Card>
		</div>
	);
}
