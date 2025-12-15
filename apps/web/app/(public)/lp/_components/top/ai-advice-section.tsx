import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@workspace/ui/components/card";
import { AlertCircle, Lightbulb, ThumbsUp } from "lucide-react";
import Image from "next/image";
import { LpSection } from "./lp-section";
import screenshotImage from "./ss-ai-advice.png";

const features = [
	{
		description: "接客の成功ポイントを明確化し、再現性を高めます。",
		icon: ThumbsUp,
		title: "良かった点の可視化",
	},
	{
		description: "見落としがちな改善ポイントを客観的に指摘。",
		icon: AlertCircle,
		title: "改善点の提案",
	},
	{
		description: "次の接客で意識すべきポイントを具体的に提案。",
		icon: Lightbulb,
		title: "次回アクションの提案",
	},
] as const;

export function AiAdviceSection() {
	return (
		<LpSection
			description="接客内容を分析し、次回に活かせるフィードバックを自動生成"
			title="AI が接客をアドバイス"
		>
			<p className="text-center text-muted-foreground mb-8 max-w-3xl mx-auto">
				記録した接客内容を AI が分析。良かった点・改善点・次回の接客アドバイスを
				自動で生成します。振り返りの手間を省き、接客品質の向上を支援します。
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

			<Image
				alt="サービスノートをもとに AI が出力した良かった点、改善点"
				className="rounded-2xl w-full aspect-auto shadow-xl/20 max-w-md mt-20 mx-auto"
				sizes="(max-width: 768px) 100vw, 448px"
				src={screenshotImage}
			/>
		</LpSection>
	);
}
