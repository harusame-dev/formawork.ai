import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@workspace/ui/components/card";
import { FileText, Sparkles, Users } from "lucide-react";
import { LpSection } from "./lp-section";

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
		<LpSection
			description="顧客管理の基本機能に加え、AI による接客支援機能を搭載しています。"
			title="このデモで体験できること"
		>
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
		</LpSection>
	);
}
