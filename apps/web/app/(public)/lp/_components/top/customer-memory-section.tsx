import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@workspace/ui/components/card";
import {
	Calendar,
	Heart,
	MessageCircle,
	ShieldCheck,
	TrendingUp,
	User,
} from "lucide-react";
import Image from "next/image";
import { LpSection } from "./lp-section";
import screenshotImage from "./ss-ai-memories.png";

const categories = [
	{
		description: "家族構成、職業、ライフステージなど基本的な属性情報",
		icon: User,
		title: "パーソナル情報",
	},
	{
		description: "好み、こだわり、興味関心など接客の参考になる情報",
		icon: Heart,
		title: "趣味趣向",
	},
	{
		description: "購買パターン、成約しやすい提案方法",
		icon: TrendingUp,
		title: "コンバージョン傾向",
	},
	{
		description: "接客時の好み、NGトピック、話し方の特徴",
		icon: MessageCircle,
		title: "コミュニケーション特性",
	},
	{
		description: "記念日、予定、ライフイベント",
		icon: Calendar,
		title: "重要イベント",
	},
	{
		description: "アレルギー、体質、施術上の注意点",
		icon: ShieldCheck,
		title: "健康・身体的配慮",
	},
] as const;

export function CustomerMemorySection() {
	return (
		<LpSection
			description="接客ノートから自動で重要情報を抽出・蓄積"
			title="AI が顧客を「覚える」"
		>
			<p className="text-center text-muted-foreground mb-8 max-w-3xl mx-auto">
				お客様との会話や接客内容を記録するだけで、AI
				が自動的に重要な情報を抽出。
				<br />
				「金属アレルギーがある」「来月結婚式」「静かに過ごしたい」など、
				<br />
				次の接客で活かせる情報を6つのカテゴリで整理します。
			</p>
			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{categories.map((category) => (
					<Card key={category.title}>
						<CardHeader className="flex flex-row gap-2 items-center pb-2">
							<div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center">
								<category.icon className="size-5 text-primary" />
							</div>
							<CardTitle className="text-base">{category.title}</CardTitle>
						</CardHeader>
						<CardContent>
							<CardDescription className="text-sm leading-relaxed">
								{category.description}
							</CardDescription>
						</CardContent>
					</Card>
				))}
			</div>

			<Image
				alt="顧客メモリ一覧画面。AI が抽出した顧客情報がカテゴリ別に表示されている"
				className="rounded-2xl w-full aspect-auto shadow-lg/20 max-w-md mt-20 mx-auto"
				sizes="(max-width: 768px) 100vw, 448px"
				src={screenshotImage}
			/>

			<div className="flex flex-wrap justify-center gap-3 mt-8">
				<span className="px-3 py-1 text-sm rounded-full bg-muted text-muted-foreground">
					最大100件/顧客
				</span>
				<span className="px-3 py-1 text-sm rounded-full bg-muted text-muted-foreground">
					重要度スコア（1-10）
				</span>
				<span className="px-3 py-1 text-sm rounded-full bg-muted text-muted-foreground">
					バックグラウンド処理
				</span>
			</div>
		</LpSection>
	);
}
