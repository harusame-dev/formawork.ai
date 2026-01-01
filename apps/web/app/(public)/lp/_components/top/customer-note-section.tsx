import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@workspace/ui/components/card";
import {
	BarChart3,
	Clock,
	FileText,
	Share2,
	Smartphone,
	Zap,
} from "lucide-react";
import Image from "next/image";
import { LpSection } from "./lp-section";
import screenshotImage from "./ss-customer-note.png";

const features = [
	{
		description: "スマートフォンからいつでも手軽にノートを記入",
		icon: Smartphone,
		title: "モバイル対応",
	},
	{
		description: "素早い入力で接客後の業務時間を短縮",
		icon: Zap,
		title: "高速入力",
	},
	{
		description: "接客内容をカテゴリごとに整理・検索可能",
		icon: FileText,
		title: "スマート整理",
	},
	{
		description: "接客の時系列で顧客の成長を可視化",
		icon: BarChart3,
		title: "履歴管理",
	},
	{
		description: "テンプレート機能で定型入力を効率化",
		icon: Clock,
		title: "テンプレート",
	},
	{
		description: "スタッフ間で接客情報をシームレスに共有",
		icon: Share2,
		title: "チーム共有",
	},
] as const;

export function CustomerNoteSection() {
	return (
		<LpSection
			description="顧客情報の一元管理を実現する接客ノート機能"
			title="接客内容をサクッと記録"
		>
			<p className="text-center text-muted-foreground mb-8 max-w-3xl mx-auto">
				お客様との会話や対応内容を素早く記録できる接客ノート機能。
				<br />
				モバイル対応で移動中でも入力でき、記録した情報は AI
				が自動で分析・整理します。
			</p>
			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{features.map((feature) => (
					<Card key={feature.title}>
						<CardHeader className="flex flex-row gap-2 items-center pb-2">
							<div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center">
								<feature.icon className="size-5 text-primary" />
							</div>
							<CardTitle className="text-base">{feature.title}</CardTitle>
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
				alt="接客ノート入力画面。スマートフォンからの入力インターフェース"
				className="rounded-2xl w-full aspect-auto shadow-lg/20 max-w-md mt-20 mx-auto"
				sizes="(max-width: 768px) 100vw, 448px"
				src={screenshotImage}
			/>

			<div className="flex flex-wrap justify-center gap-3 mt-8">
				<span className="px-3 py-1 text-sm rounded-full bg-muted text-muted-foreground">
					無制限記録
				</span>
				<span className="px-3 py-1 text-sm rounded-full bg-muted text-muted-foreground">
					リアルタイム同期
				</span>
				<span className="px-3 py-1 text-sm rounded-full bg-muted text-muted-foreground">
					自動タグ付け
				</span>
			</div>
		</LpSection>
	);
}
