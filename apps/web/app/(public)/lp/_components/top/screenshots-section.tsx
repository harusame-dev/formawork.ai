import { Card, CardContent } from "@workspace/ui/components/card";
import Image from "next/image";
import aiAdviceSS from "./ai-advice-thumbnail.png";
import { LpSection } from "./lp-section";
import serviceNoteSS from "./service-note-thumbnail.png";

const screenshots = [
	{
		alt: "サービスノートの編集ダイアログ。テキストを入力する欄と画像が３枚選択されている",
		description: "接客内容を画像付きでデータとして残せます。",
		image: serviceNoteSS,
		title: "サービスノート",
	},
	{
		alt: "サービスノートをもとに AI が出力した良かった点、改善点",
		description:
			"AI が接客内容を分析し、良かった点・改善点・次回のアドバイスを自動生成します。",
		image: aiAdviceSS,
		title: "AI 接客アドバイス",
	},
] as const;

export function ScreenshotsSection() {
	return (
		<LpSection
			description="実際のシステム画面をご覧いただけます。"
			title="画面イメージ"
		>
			<div className="grid gap-8 md:grid-cols-2">
				{screenshots.map((screenshot) => (
					<Card className="overflow-hidden" key={screenshot.title}>
						<div className="aspect-video relative m-4">
							<Image
								alt={screenshot.alt}
								className="rounded-2xl object-cover shadow-md"
								fill
								loading="eager"
								sizes="(max-width: 768px) 100vw, 50vw"
								src={screenshot.image}
							/>
						</div>
						<CardContent className="pt-4">
							<h3 className="font-semibold mb-1">{screenshot.title}</h3>
							<p className="text-sm text-muted-foreground">
								{screenshot.description}
							</p>
						</CardContent>
					</Card>
				))}
			</div>
		</LpSection>
	);
}
