import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@workspace/ui/components/card";
import { FileText, Sparkles, Users } from "lucide-react";

const features = [
	{
		description:
			"顧客の基本情報を登録・検索・管理。必要な情報にすぐアクセスできます。",
		icon: Users,
		title: "顧客情報の一元管理",
	},
	{
		description: "接客内容を記録し、画像も添付可能。顧客との履歴を残せます。",
		icon: FileText,
		title: "接客記録の蓄積",
	},
	{
		description:
			"記録した接客内容を AI が分析。良かった点と改善点、次回の接客アドバイスを自動生成します。",
		icon: Sparkles,
		title: "AI による接客アドバイス",
	},
] as const;

export function FeaturesSection() {
	return (
		<section className="py-16 px-4 bg-muted/60">
			<div className="container mx-auto max-w-5xl">
				<h2 className="text-2xl font-bold text-center mb-4">
					このデモで体験できること
				</h2>
				<p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
					顧客管理の基本機能に加え、AI による接客支援機能を搭載しています。
				</p>
				<div className="grid gap-6 md:grid-cols-3">
					{features.map((feature) => (
						<Card key={feature.title}>
							<CardHeader className="flex flex-row gap-2 items-center">
								<div className="size-12 rounded-lg bg-primary/10 flex items-center justify-center">
									<feature.icon className="size-6 text-primary" />
								</div>
								<CardTitle className="text-lg">{feature.title}</CardTitle>
							</CardHeader>
							<CardContent>
								<CardDescription className="text-sm leading-relaxed">
									{feature.description}
								</CardDescription>
							</CardContent>
						</Card>
					))}
				</div>
			</div>
		</section>
	);
}
